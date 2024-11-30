import pandas as pd
from collections import Counter
from lexicon import lexicon
import json  # For saving and managing large forward indices

# Loading the dataset into panda's data frame
csv_path = "D:/Downloads/book1.csv"
data = pd.read_csv(csv_path)

forward_index = {}

# Building the forward index
for index, row in data.iterrows():
    # Using the counter to count word frequencies efficiently
    word_counts = Counter(row['title'] + row['keywords'] + row['abstract'])

    # Coverting the words(keys) into their respective ids from the lexicon
    word_counts = {lexicon[key]: value for key, value in word_counts.items()}

    # storing in the forward_index dict
    forward_index[index+1] = word_counts



# Save the forward index to a JSON file for persistence and handling large data
# JSON is suitable for saving large dictionaries as text files

# with open("forward_index.json", "w") as file:
# json.dump(forward_index, file)


# Display a limited number of forward index entries (first 5 documents)
'''for i, (doc_id, word_freq) in enumerate(forward_index.items()):
    if i >= 5:  # Limit the display to the first 5 documents
        break
    print("Document ID:", doc_id)
    print("Word Frequencies:", word_freq)
    print("-" * 40)  # Separator for readability
'''

# Display the forward index for the entire dataset
'''for doc_id, word_freq in forward_index.items():
    print("Document ID:", doc_id)
    print("Word Frequencies:", word_freq)
    print("-" * 100)  
'''
