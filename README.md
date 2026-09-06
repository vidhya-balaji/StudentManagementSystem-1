https://student-management-system-frontend-three.vercel.app/

"""
Agentic AI version (multi-agent + persistent memory)
--------------------------------------------------------
Difference from rag_agent.py (which was single-agent Agentic RAG):

1. DEDICATED AGENTS instead of one agent holding all tools directly:
      - retrieval_agent   -> ONLY handles policy search, can refine its own query
      - hr_action_agent   -> ONLY handles tickets/leave actions
      - orchestrator_agent -> the one you talk to; delegates to the above two

   The orchestrator doesn't call search_policy directly anymore - it calls
   the retrieval_agent, which is itself a small reasoning agent (not a
   plain function). This is the "agent-as-tool" pattern.

2. PERSISTENT MEMORY using SQLite, so conversation history survives
   between runs. Close the script, reopen it tomorrow - it remembers
   the employee's past questions/tickets (previous versions forgot
   everything the moment you closed the terminal).

Install:
    pip install langchain langchain-ollama langchain-huggingface langchain-community faiss-cpu --break-system-packages

Run:
    python agentic_ai_multiagent.py
"""

from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_ollama import ChatOllama

# ============================================================
# CONFIGURATION
# ============================================================

DB_PATH = "faiss_index"
MEMORY_DB = "sqlite:///chat_memory.db"   # persistent file on disk, survives restarts

llm = ChatOllama(model="llama3.1", temperature=0)


# ============================================================
# LOAD YOUR EXISTING FAISS INDEX
# ============================================================

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

if not Path(DB_PATH).exists():
    raise FileNotFoundError(f"'{DB_PATH}' not found. Run create_db_with_pdf_ocr.py first.")

vector_db = FAISS.load_local(DB_PATH, embeddings, allow_dangerous_deserialization=True)
retriever = vector_db.as_retriever(search_kwargs={"k": 3})


# ============================================================
# AGENT 1: RETRIEVAL AGENT
#   Its only job is policy search. It can rewrite/refine the query itself
#   before searching - that reasoning step is what makes it an agent and
#   not just a plain function.
# ============================================================

@tool
def vector_search(query: str) -> str:
    """Run a raw similarity search against the policy vector database."""
    docs = retriever.invoke(query)
    return "\n---\n".join(d.page_content for d in docs) if docs else "No results found."


retrieval_agent_executor = AgentExecutor(
    agent=create_tool_calling_agent(
        llm,
        [vector_search],
        ChatPromptTemplate.from_messages([
            ("system", "You find the most relevant company policy passages. "
                       "If the first search seems weak, rewrite the query and search again "
                       "before giving up. Return the raw relevant passages, do not summarize."),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad"),
        ]),
    ),
    tools=[vector_search],
    verbose=False,
)


@tool
def retrieval_agent(question: str) -> str:
    """Delegate to the retrieval specialist agent to find relevant company
    policy passages for a question. Use for ANY policy/rules question."""
    result = retrieval_agent_executor.invoke({"input": question})
    return result["output"]


# ============================================================
# AGENT 2: HR ACTION AGENT
#   Its only job is actions (tickets, leave balance lookups). Kept
#   separate from retrieval so policy lookups and HR-system actions
#   never get mixed into one giant tool list.
# ============================================================

@tool
def get_leave_balance(employee_id: str) -> str:
    """Look up an employee's leave balance from the HR system."""
    fake_hr_db = {"E1001": 7, "E1002": 3}   # replace with real HR API
    balance = fake_hr_db.get(employee_id)
    return f"Employee {employee_id} has {balance} leaves remaining." if balance is not None \
        else f"No record for {employee_id}."


@tool
def raise_hr_ticket(employee_id: str, request_type: str, details: str) -> str:
    """Raise an HR ticket. Only call after the user has explicitly confirmed."""
    return f"Ticket HR-20450 created for {employee_id}: [{request_type}] {details}"


hr_action_agent_executor = AgentExecutor(
    agent=create_tool_calling_agent(
        llm,
        [get_leave_balance, raise_hr_ticket],
        ChatPromptTemplate.from_messages([
            ("system", "You handle HR actions: checking leave balance and raising tickets. "
                       "NEVER raise a ticket unless the request clearly says the user confirmed it."),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad"),
        ]),
    ),
    tools=[get_leave_balance, raise_hr_ticket],
    verbose=False,
)


@tool
def hr_action_agent(request: str) -> str:
    """Delegate to the HR actions specialist agent for leave balance checks
    or raising tickets/requests. Use for anything actionable, not for
    general policy questions."""
    result = hr_action_agent_executor.invoke({"input": request})
    return result["output"]


# ============================================================
# ORCHESTRATOR AGENT
#   This is the one the user actually talks to. It doesn't do retrieval
#   or HR actions itself - it decides WHICH SPECIALIST AGENT to delegate to.
#   This delegation is what makes it multi-agent instead of single-agent.
# ============================================================

ORCHESTRATOR_PROMPT = """You are the company assistant. You do not answer
policy questions or take HR actions yourself - you delegate:

- For questions about company rules/policy -> call retrieval_agent
- For leave balance checks or raising tickets/requests -> call hr_action_agent
- You may call both if a question needs both (e.g. "what's the leave carry-forward
  rule AND how many do I have left")
- Never fabricate information not returned by the specialist agents
"""

orchestrator_prompt = ChatPromptTemplate.from_messages([
    ("system", ORCHESTRATOR_PROMPT),
    MessagesPlaceholder("history"),          # <- persistent memory slots in here
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])

orchestrator_agent = create_tool_calling_agent(
    llm, [retrieval_agent, hr_action_agent], orchestrator_prompt
)

orchestrator_executor = AgentExecutor(
    agent=orchestrator_agent,
    tools=[retrieval_agent, hr_action_agent],
    verbose=True,
)


# ============================================================
# PERSISTENT MEMORY  (SQLite - survives closing/reopening the script)
# ============================================================

def get_session_history(session_id: str) -> SQLChatMessageHistory:
    return SQLChatMessageHistory(session_id=session_id, connection=MEMORY_DB)


orchestrator_with_memory = RunnableWithMessageHistory(
    orchestrator_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)


# ============================================================
# CHAT LOOP
# ============================================================

if __name__ == "__main__":
    print("\n======================================")
    print("   AGENTIC AI (multi-agent + memory)")
    print("======================================")

    employee_id = input("Enter your employee ID (used as memory session id): ").strip()
    print(f"\nHi {employee_id}. Ask me anything. Type 'exit' to stop.\n")

    while True:
        question = input("You: ")
        if question.lower() == "exit":
            print("Goodbye! Your conversation is saved for next time.")
            break

        result = orchestrator_with_memory.invoke(
            {"input": question},
            config={"configurable": {"session_id": employee_id}},
        )

        print("\nAI:", result["output"])
        print("\n" + "=" * 60)
======================================================================
Code 2
=====================================================================
"""
STREAMLIT VERSION of your agentic RAG script
==============================================
Same agent, same tools, same FAISS index -- only the interface changed.

What changed vs the PyCharm/terminal version:
  - input() / print()          -> st.chat_input() / st.chat_message()
  - while True loop             -> Streamlit reruns the whole script on every
                                    message, so chat history is kept in
                                    st.session_state instead of a Python list
                                    that lives only while the loop is running
  - Embeddings/FAISS/Agent load -> wrapped in @st.cache_resource so they load
    ONCE per session, not on every single message (Streamlit reruns the
    entire script top-to-bottom on every interaction, so without caching
    you'd reload the embedding model and rebuild the agent every message)

RUN THIS WITH:
    streamlit run streamlit_agentic_rag.py

(Do NOT run it with `python streamlit_agentic_rag.py` -- Streamlit apps
must be launched with the `streamlit run` command, not as a plain script.)

SETUP (same as before):
    pip install streamlit langchain langchain-ollama langchain-huggingface langchain-community faiss-cpu --break-system-packages
    ollama pull llama3.1
"""

from pathlib import Path

import streamlit as st

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_ollama import ChatOllama


# ============================================================
# CONFIGURATION  (unchanged)
# ============================================================

PDF_FILE = "company_policy.pdf"
DB_PATH = "faiss_index"


# ============================================================
# 1. BUILD / LOAD EVERYTHING ONCE  (cached across the whole session)
# ============================================================
# @st.cache_resource tells Streamlit: "run this function once, keep the
# result in memory, and hand back the same object on every rerun instead
# of recomputing it." This is the Streamlit equivalent of your
# if Path(DB_PATH).exists(): ... else: ... check, but it also prevents
# reloading the embedding model and rebuilding the agent every message.

@st.cache_resource(show_spinner="Loading embedding model and FAISS index...")
def load_vector_db():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    if Path(DB_PATH).exists():
        vector_db = FAISS.load_local(
            DB_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
    else:
        loader = PyPDFLoader(PDF_FILE)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.split_documents(documents)

        vector_db = FAISS.from_documents(chunks, embeddings)
        vector_db.save_local(DB_PATH)

    return vector_db


@st.cache_resource(show_spinner="Setting up the agent...")
def load_agent():
    vector_db = load_vector_db()
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})

    # ----------------------------------------------------------
    # TOOLS  (identical to your PyCharm version)
    # ----------------------------------------------------------

    @tool
    def search_policy(query: str) -> str:
        """Search the company policy PDF and return the most relevant passages
        for the given question. Use this for ANY question about company rules,
        leave, WFH, expenses, IT, or compliance."""
        docs = retriever.invoke(query)
        if not docs:
            return "No matching policy content found."
        return "\n---\n".join(d.page_content for d in docs)

    @tool
    def raise_hr_ticket(employee_id: str, request_type: str, details: str) -> str:
        """Raise an HR ticket/request on behalf of the employee. Only call this
        AFTER the user has explicitly confirmed they want the action taken -
        never call this just because a policy question was asked."""
        ticket_id = "HR-20450"
        return f"Ticket {ticket_id} created for {employee_id}: [{request_type}] {details}"

    tools = [search_policy, raise_hr_ticket]

    # ----------------------------------------------------------
    # LLM  (must support tool calling)
    # ----------------------------------------------------------

    llm = ChatOllama(model="llama3.1", temperature=0)

    # ----------------------------------------------------------
    # AGENT
    # ----------------------------------------------------------
    # create_react_agent (from langgraph.prebuilt) is the current
    # replacement for the old create_tool_calling_agent + AgentExecutor
    # combo, which was removed from langchain.agents in recent
    # LangChain releases. It builds the same "LLM decides which tool
    # to call, runs it, feeds the result back" loop, just implemented
    # on top of LangGraph instead of the old AgentExecutor class.

    SYSTEM_PROMPT = """You are the company Policy Assistant.
Rules you must always follow:
- Answer policy questions using ONLY the search_policy tool's results. Never invent policy details.
- If the answer is not present in the retrieved content, say you don't know and suggest contacting HR.
- Never call raise_hr_ticket unless the user has clearly confirmed they want that action taken.
- Be concise and stick to what the retrieved content actually says.
"""

    return create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)


# ============================================================
# 2. PAGE SETUP
# ============================================================

st.set_page_config(page_title="Policy Assistant", page_icon="\U0001F4CB")
st.title("Agentic RAG Chatbot")
st.caption("Ask about company policy, or ask it to raise an HR request.")

agent_executor = load_agent()


# ============================================================
# 3. CHAT HISTORY
# ============================================================
# st.session_state persists across reruns WITHIN one browser session --
# this is what replaces the Python list you'd normally build up inside
# a while True loop.

if "messages" not in st.session_state:
    st.session_state.messages = []

# Redraw all previous messages on every rerun (Streamlit reruns the
# whole script top to bottom every time the user sends a new message)
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])


# ============================================================
# 4. CHAT INPUT  (replaces: question = input("You: "))
# ============================================================

user_question = st.chat_input("Ask a question...")

if user_question:

    # Show the user's message immediately
    with st.chat_message("user"):
        st.markdown(user_question)
    st.session_state.messages.append({"role": "user", "content": user_question})

    # Run the agent (replaces: result = agent_executor.invoke(...))
    # create_react_agent takes/returns a list of messages, not input/output
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            result = agent_executor.invoke(
                {"messages": [{"role": "user", "content": user_question}]}
            )
            answer = result["messages"][-1].content
        st.markdown(answer)

    st.session_state.messages.append({"role": "assistant", "content": answer})
