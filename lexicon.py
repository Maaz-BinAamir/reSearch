import pandas as pd

# Initializing lexicon (dict)
lexicon = {}

# Reading the Processed Text from the CSV 
data = pd.read_csv("processed_text.csv")

# Creating the 'processed_text' column by concatenating non-NaN values from 'title', 'abstract', and 'keywords'
data['processed_text'] = data.apply(lambda row: " ".join([str(row[col]) for col in ['title', 'abstract', 'keywords'] if pd.notna(row[col])]), axis=1)

# applying the split operation to the 'processed_text' column
data['processed_text'] = data['processed_text'].apply(lambda x: x.split())

def make_lexicon(column):
    id = 1

    for tokens in column:
        for word in tokens:
            #check if word is in lexicon
            if word not in lexicon:
                lexicon[word] = id
                id += 1


make_lexicon(data['processed_text'])


# Convert the lexicon dictionary to a DataFrame for exporting
df = pd.DataFrame(list(lexicon.items()), columns=["Word", "WordId"])

# Export the DataFrame to a CSV file
df.to_csv("lexicon.csv", index=False)