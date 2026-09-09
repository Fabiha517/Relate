# Relate

Relate is an AI-powered learning application designed to make difficult and abstract concepts easier to understand.

Instead of simply giving users a definition, Relate connects a concept to something familiar. Users choose an **analogy world** such as a restaurant, city, sports, movies, or another familiar environment, and Relate uses that world to explain how the concept actually works.

The goal is simple:

> **Understand difficult ideas by relating them to things you already know.**

---

## ✨ Features

### 🧠 AI-Powered Analogies

Enter any concept you want to understand and choose an analogy world.

Relate generates:

- A beginner-friendly explanation
- A coherent analogy
- Concept-to-analogy mappings
- A visual model
- Important relationships and process flow
- A concrete example
- Limitations of the analogy

The analogy is designed to explain the real concept, rather than simply replacing technical terms with familiar objects.

---

### 🌎 Analogy Worlds

Users can understand a concept through different familiar worlds.

Examples include:

- 🍽️ Restaurant
- 🏙️ City
- ⚽ Sports
- 🎬 Movies

Different worlds provide different ways of visualizing the same underlying concept.

For example, an API can be explained using a restaurant:

```text
Customer  →  Application
Waiter    →  API
Kitchen   →  Server
Order     →  Request
Meal      →  Response
```

---

### 🗺️ Visual Concept Models

Relate converts the generated analogy into a visual model.

The model shows how important parts of the real concept correspond to elements of the analogy.

It can represent different types of behavior, including:

- Sequential processes
- Branching
- Communication
- Repetition
- Recursion
- Feedback
- Returning results

The visual model is intended to help users understand relationships at a glance.

---

### 📚 Beginner-First Learning

Relate is designed for users who may have little or no prior knowledge of a topic.

Explanations prioritize:

- Simple language
- Short sentences
- Familiar examples
- Clear processes
- Gradual introduction of terminology

Technical terms are not removed when they are important. Instead, unfamiliar terms can be explained briefly when first introduced.

For example:

> Parsing (checking how code pieces fit together)

This allows Relate to remain technically accurate while still being approachable to beginners.

---

### 📝 Practice

Relate also provides practice sessions to help users test their understanding after learning a concept.

Users can:

- Generate practice questions
- Answer questions
- Receive AI-based evaluation
- Review previous sessions
- Generate additional questions
- Track their practice history

The purpose of practice is to move from simply reading an explanation to actively demonstrating understanding.

---

## 🎯 How Relate Works

The learning experience follows a simple progression:

```text
Choose a Concept
       ↓
Choose an Analogy World
       ↓
Understand the Real Concept
       ↓
Understand the Basic Mechanism
       ↓
Explore the Analogy
       ↓
Connect the Analogy to the Concept
       ↓
Explore the Visual Model
       ↓
Practice
```

The learner should eventually understand the real concept without needing the analogy.

---

## 💡 Example

Suppose the user asks:

> How does a compiler convert code into machine instructions?

and chooses:

> **Restaurant**

Relate can explain the process through a restaurant order.

The customer writes an order in a language that is easy for them.

The waiter reads and organizes the order.

The order is checked to make sure it makes sense.

The kitchen creates an organized plan for preparing it.

The plan can be improved to make the work more efficient.

Finally, precise instructions are created that the kitchen can follow.

This can then be connected back to the compiler:

```text
Customer's order
        ↓
Source code

Understanding the order
        ↓
Lexical analysis + parsing

Organized kitchen plan
        ↓
Intermediate representation

Making the plan more efficient
        ↓
Optimization

Exact cooking instructions
        ↓
Machine code

Kitchen executing the instructions
        ↓
CPU executing the program
```

The purpose is not to make the learner memorize the restaurant.

It is to make the compiler's process easier to visualize.

---

## 📁 Project Structure

```text
Relate/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── ...
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── prompts/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   └── ...
│
├── README.md
└── ...
```

---

## 🔐 Authentication

Relate includes user authentication and account functionality.

Users can:

- Create an account
- Log in
- Log out
- Access protected pages
- Manage their profile
- Reset their password

Password reset emails are sent through AgentMail.

Sensitive credentials such as JWT secrets, database credentials, AI API keys, and email API keys are stored through environment variables.

---

## 🎨 Design Philosophy

Relate is intentionally designed to feel different from a traditional educational dashboard.

The interface combines a visual learning canvas with a playful but refined visual language.

The design focuses on:

- Visual storytelling
- Clear relationships between ideas
- Warm, expressive visuals
- Playful but professional interactions
- A learning experience that feels exploratory rather than dashboard-driven

---

## 🧩 AI Generation Philosophy

Relate follows a **teaching-first, analogy-second** approach.

The AI should not simply produce:

```text
Technical term → Familiar object
```

Instead, it should explain:

```text
How the real concept works
        ↓
Simplify the mechanism
        ↓
Build a familiar analogy
        ↓
Connect the analogy back to reality
```

This is especially important for complex subjects.

Important stages, behaviors, relationships, recursion, branching, communication, and other meaningful mechanisms should not be removed simply to make an analogy shorter.

At the same time, unnecessary technical jargon and irrelevant detail should be avoided.

### Simple Analogy Language

The analogy world should use simple, familiar language whenever possible.

Technical terminology should not be forced into the analogy just because the real concept uses technical terms.

When a technical term is necessary, Relate can introduce it with a short beginner-friendly meaning.

For example:

> **Optimization** (making the program more efficient)

This keeps the explanation technically accurate without making the analogy difficult to follow.

### The Learning Goal

The analogy is a bridge, not the destination.

Relate should help the learner move from:

```text
Familiar world
      ↓
Understanding the mechanism
      ↓
Understanding the real concept
      ↓
Understanding the concept without the analogy
```

The final goal is genuine understanding rather than memorization of the analogy.
