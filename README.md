# Research

A search engine to search on the research paper's dataset. Our base architecture is based on the paper published by Google. But inorder to reduce query time from 60s to a few hundred milliseconds, many changes were made.

## Major Parts
The code mainly consists of these major parts
- Backend (Flask) -> is responsible for api routes from which the data is fetched to the frontend. Also has the results ranking logic. Cache is used for quick data service.
- Frontend (Next.js) -> is responsible for the query interface and displaying the results.
- data_cleaning.py
- data_prepocessing
- lexicon, forward index, inverted index, barrels (all the part of the architecture of the search engine)

## Dataset
The dataset used was https://www.kaggle.com/datasets/agungpambudi/research-citation-network-5m-papers. We had used only 200,000 research papers because of hardware constraints.

## Key Features (Frontend)
The frontend includes:
- Autocomplete suggestions while searching
- Sorting results by Relevance (our custom ranking function), by Number of citations and by Year
- Adding a new article, which is searchable within a few seconds.
- Bookmarking articles and viewing them from the bookmark side menu.

## Screenshots
<img width="1920" height="1080" alt="Screenshot_101" src="https://github.com/user-attachments/assets/a6ef162d-3a4a-4422-87cd-7b7043f1055d" />
<img width="1920" height="1080" alt="Screenshot_102" src="https://github.com/user-attachments/assets/8c30c2d8-f70f-4fae-be3c-bc39347f1497" />
<img width="1920" height="1080" alt="Screenshot_103" src="https://github.com/user-attachments/assets/49ba7200-33bb-4dbe-973d-c03f21d10f15" />
<img width="1920" height="1080" alt="Screenshot_104" src="https://github.com/user-attachments/assets/029370f9-f989-4524-bb4c-14eca09f7f1a" />
