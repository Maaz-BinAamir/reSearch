import pandas as pd
from collections import Counter

# Reading the Processed Text from the CSV 
data = pd.read_csv("processed_text.csv")

# Converting the processed title, abstract and keywords to a list
data['title'] = data['title'].apply(lambda x: str(x)).apply(lambda x: x.split())
data['abstract'] = data['abstract'].apply(lambda x: str(x)).apply(lambda x: x.split())
data['keywords'] = data['keywords'].apply(lambda x: str(x)).apply(lambda x: x.split())

# Loading the CSV file into a DataFrame
lexicon_df = pd.read_csv("lexicon.csv")

# Converting the DataFrame back to a dictionary
lexicon = dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))

# Define weights for title, abstract, and keywords sections
section_weights = {
    'title': 5.0,
    'keywords': 3.0,
    'abstract': 1.0
}


# Building the forward index
def make_forward_index():
    forward_index = {}

    for index, row in data.iterrows():
        title_words = row['title']
        keyword_words = row['keywords']
        abstract_words = row['abstract']

        # Get word counts for each section
        title_word_counts = Counter(title_words)
        keyword_word_counts = Counter(keyword_words)
        abstract_word_counts = Counter(abstract_words)

        total_title_words = len(title_words)
        total_keyword_words = len(keyword_words)
        total_abstract_words = len(abstract_words)

        # Check each unique word
        for word in set(title_words + keyword_words + abstract_words):  
            word_id = lexicon.get(word)
            
            if word_id:
                weighted_density = 0

                # Calculating word density and applying weights for their respective sections
                if word in title_word_counts:
                    word_density_value = title_word_counts[word] / total_title_words
                    weighted_density += word_density_value * section_weights['title']

                if word in keyword_word_counts:
                    word_density_value = keyword_word_counts[word] / total_keyword_words
                    weighted_density += word_density_value * section_weights['keywords']

                if word in abstract_word_counts:
                    word_density_value = abstract_word_counts[word] / total_abstract_words
                    weighted_density += word_density_value * section_weights['abstract']

                # Add word ID and weighted density to the forward index
                if index+1 not in forward_index:
                    forward_index[index+1] = {}

                # Store for each document
                forward_index[index + 1][word_id] = weighted_density  

    return forward_index

forward_index = make_forward_index()

# Converting forward_index to a DataFrame for exporting
export_data = []

export_data = [
    {"DocumentID": doc_id, "word_scores": word_scores}
    for doc_id, word_scores in forward_index.items()
]

# Creating a DataFrame
df = pd.DataFrame(export_data)

# Exporting the DataFrame to a CSV file
df.to_csv("forward_index.csv", index=False)