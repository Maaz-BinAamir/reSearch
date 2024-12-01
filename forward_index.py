import pandas as pd
from collections import Counter

# Reading the Processed Text from the CSV 
data = pd.read_csv("processed_text.csv")

# Converting the processed_text back to a list
data['processed_text'] = data['processed_text'].apply(eval)

# Loading the CSV file into a DataFrame
lexicon_df = pd.read_csv("lexicon.csv")

# Converting the DataFrame back to a dictionary
lexicon = dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))

#Initializing forward_index (nested dict)
forward_index = {}

# Building the forward index
def make_forward_index():
    for index, row in data.iterrows():
        # Using the counter to count word frequencies efficiently
        word_counts = Counter(row['processed_text'])

        # Coverting the words(keys) into their respective ids from the lexicon
        word_counts = {lexicon[key]: value for key, value in word_counts.items()}

        # storing in the forward_index dict
        forward_index[index+1] = word_counts

make_forward_index()

# Converting forward_index to a DataFrame for exporting
export_data = []

export_data = [
    {"DocumentID": doc_id, "word_counts": word_counts}
    for doc_id, word_counts in forward_index.items()
]

# Creating a DataFrame
df = pd.DataFrame(export_data)

# Exporting the DataFrame to a CSV file
df.to_csv("forward_index.csv", index=False)