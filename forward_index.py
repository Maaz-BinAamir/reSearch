import pandas as pd
from collections import Counter
import json

csv_path = "processed_text.csv"
data = pd.read_csv(csv_path)

data['processed_text'] = data['processed_text'].apply(eval)

# Path to the lexicon CSV file
lexicon_csv_path = "lexicon.csv"

# Load the CSV file into a DataFrame
lexicon_df = pd.read_csv(lexicon_csv_path)

# Convert the DataFrame back to a dictionary
lexicon = dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))

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

for doc_id, word_counts in forward_index.items():
    export_data.append({
        "DocumentID": doc_id,
        "word_counts": word_counts
    })

# Creating a DataFrame
df = pd.DataFrame(export_data)

# Exporting the DataFrame to a CSV file
output_csv_path = "forward_index.csv"
df.to_csv(output_csv_path, index=False)