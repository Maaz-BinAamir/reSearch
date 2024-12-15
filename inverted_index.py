import pandas as pd
import json

# Loading the CSV's into a DataFrame
lexicon_df = pd.read_csv("lexicon.csv")
forward_index_df = pd.read_csv("forward_index.csv")

# Converting the Lexicon's DataFrame back to lexicon (dict)
lexicon = dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))

# Converting the Forward Index's DataFrame back to forward_index (nested dict)
forward_index = {}
forward_index_df['word_scores'] = forward_index_df['word_scores'].apply(eval)

for _, row in forward_index_df.iterrows():
    word_scores = row['word_scores']
    
    forward_index[row['DocumentID']] = word_scores

#Initializing inverted_index (dict)
inverted_index = {}

def make_inverted_index():
    for word, word_id in lexicon.items():
        for doc_id, word_scores in forward_index.items():
            # check if the word_id of the word in lexicon exists in the document's word_scores dict
            if word_id in word_scores:
                if word_id not in inverted_index:
                    inverted_index[word_id] = [(doc_id, word_scores[word_id])]
                else:
                    inverted_index[word_id].append((doc_id, word_scores[word_id]))
                
make_inverted_index()

# Converting inverted_index to a DataFrame for exporting
export_data = [
    {"WordId": word_id, "DocumentIds_score": json.dumps(doc_ids)}
    for word_id, doc_ids in inverted_index.items()
]

# Creating a DataFrame
df = pd.DataFrame(export_data)

# Exporting the DataFrame to a CSV file
df.to_csv("inverted_index.csv", index=False)