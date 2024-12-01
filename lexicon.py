import pandas as pd

#Initializing lexicon (dict)
lexicon = {}

csv_path = "processed_text.csv"
data = pd.read_csv(csv_path)

data['processed_text'] = data['processed_text'].apply(eval)

def makeLexicon(column):
    id = 1

    for tokens in column:
        for word in tokens:
            #check if word is in lexicon
            if word not in lexicon:
                lexicon[word] = id
                id += 1



makeLexicon(data['processed_text'])
    
# Convert the lexicon dictionary to a DataFrame for exporting
lexicon_df = pd.DataFrame(list(lexicon.items()), columns=["Word", "WordId"])

# Export the DataFrame to a CSV file
lexicon_df.to_csv("lexicon.csv", index=False)