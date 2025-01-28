import json
import os

def create_assistant(client):
  assistant_file_path = 'assistant.json'

  if os.path.exists(assistant_file_path):
    with open(assistant_file_path, 'r') as file:
      assistant_data = json.load(file)
      assistant_id = assistant_data['assistant_id']
      print("Loaded existing assistant ID.")
  else:
    file = client.files.create(file=open("knowledge.docx", "rb"),
                             purpose='assistants')

    assistant = client.beta.assistants.create(
          model="gpt-4-1106-preview",
          name="Aquinas College Assistant",
          description="A helpful assistant for Aquinas College students",
          instructions="""
          The assistant, Aquinas College's Student Assistant has been programmed to provide student information in friendly and concise way
          """,
          tools=[{
              "type": "file_search"  # Changed from 'retrieval' to 'file_search'
          }],
          file_ids=[file.id])

    with open(assistant_file_path, 'w') as file:
      json.dump({'assistant_id': assistant.id}, file)
      print("Created a new assistant and saved the ID.")

    assistant_id = assistant.id

  return assistant_id