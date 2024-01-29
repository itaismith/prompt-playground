# Prompt Playground

Skeleton code for students to experiment with different LLM techinques and tools to build a chat-bot in a CS/DS 1 course.

To get started, create a `.env` file in the `server/` directory. Here is one simple way to do it in the terminal:

```
cd prompt-playground
touch server/.env
```

Then, install and run Docker. Then in the terminal run

```
docker-compose up
```

The chat interface will be available in localhost:3000. 

Assignments using this interface should consist of completing different implementations of the abstract `Messanger` class. A `Messanger` object can generate a stream of the next AI-generated response in a conversation, and provide a title for the conversation. This draft is wired with a solution using the OpenAI API.

Any API keys should go into the locally created .env file.
