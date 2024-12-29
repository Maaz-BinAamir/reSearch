import pandas as pd
import csv

# reading the csv file
df = pd.read_csv("D:\\code\\python 2.0\\dblp-citation-network-v14.csv", delimiter = "|")

# Cleaning the data
# Removing data with no keywords or no URL
df = df[df['keywords'] != "[]"]
df = df[df['url'] != "[]"]

# Remove rows where abstract is NaN
df = df[df['abstract'].notna()]

# Remove rows where the length of abstract is less than a threshold (350 chars)
min_length = 350
df = df[df['abstract'].str.len() >= min_length]

# Selecting the columns of the dataset we want to implement search
columns_to_display = ['title', 'abstract', 'year', 'keywords', 'n_citation', 'url']

# Outputing the csv file containing the first 200,000 rows
output_path = "D:\\code\\DSAProject\\reSearch\\exported_data_final.csv"

df[columns_to_display].head(200000).to_csv(output_path, index=False)


def clean_csv(input_path, output_path, delimiter="|"):
    """
    Standardizes a CSV file by removing/replacing newline characters within fields.
    """
    with open(input_path, "r", encoding="utf-8") as infile, \
         open(output_path, "w", encoding="utf-8", newline="") as outfile:
        
        reader = csv.reader(infile, delimiter=delimiter)
        writer = csv.writer(outfile, delimiter=delimiter)
        
        for row in reader:
            # Replace newline characters (\n, \r) in each field
            cleaned_row = [field.replace("\n", " ").replace("\r", " ") for field in row]
            writer.writerow(cleaned_row)

    print(f"Cleaned CSV written to {output_path}")

input_csv = "D:\\code\\DSAProject\\reSearch\\exported_data_final.csv"
output_csv = "D:\\code\\DSAProject\\reSearch\\cleaned_data_final.csv"

clean_csv(input_csv, output_csv)