# Samur Activations Viewer

This project is a Next.js application that displays the latest SAMUR emergency activations in Madrid using a SPARQL endpoint. The data is retrieved from a local Fuseki server and visualized on the frontend.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [SPARQL Query Details](#sparql-query-details)
- [Troubleshooting](#troubleshooting)

## About the Project

The Samur Activations Viewer allows users to view the latest SAMUR (Madrid Emergency Medical Service) activations. Data is fetched from a SPARQL endpoint hosted locally on a Fuseki server, processed in Next.js, and displayed with essential activation details such as the emergency type, time of request, intervention time, and associated hospital/district information.

## Features

- Fetch and display SAMUR activation data from a SPARQL endpoint.
- Present data with a clean and responsive interface.
- Link to external resources (e.g., Wikidata) for district and hospital information.
- Show loading animation while data is being fetched.

## Technologies Used

- **Next.js** - React framework for server-rendered applications.
- **TypeScript** - Typed JavaScript for more robust code.
- **SPARQL** - Semantic query language for databases.
- **Fuseki** - SPARQL server to store and query RDF data.
- **Tailwind CSS** - Utility-first CSS framework for styling.
- **React** - JavaScript library for building user interfaces.

## Getting Started
### Prerequisites

Ensure you have the following installed:

- **Node.js** and **npm**: [Download and install Node.js](https://nodejs.org/)
- **Apache Jena Fuseki**: [Download and set up Fuseki](https://jena.apache.org/documentation/fuseki2/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/allgaleano/samur-activations-RDF.git
cd samur-activations-RDF
```

#### Install dependencies:

```bash
npm install
```

#### Configure Fuseki:

- Start your Fuseki server and create a dataset named samur-activations-complete.
- Upload your RDF data (e.g., SAMUR activations) to this dataset.

#### Update the SPARQL endpoint in your code if it differs from the default:

```javascript
const endpoint = 'http://localhost:3030/samur-activations-complete/sparql';
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000 in your browser to view the app.

## Project Structure
```
.
├── components
│   └── data.tsx               # Data component for displaying label-data pairs
├── pages
│   └── index.tsx              # Main page displaying SAMUR activations
├── public
│   └── bars-rotate-fade.svg   # Loader image
├── styles
│   └── globals.css            # Global styles
├── README.md
└── package.json
```

## Usage

The app fetches activation data and displays the following information:

- Activation ID
- Year
- Month
- Request Time
- Intervention Time
- Emergency Type
- District (link to Wikidata if available)
- Hospital (link to Wikidata if available)

## SPARQL Query Details

The application sends the following SPARQL query to the endpoint to retrieve activation data:

```
PREFIX samur: <http://samur.linkeddata.madrid.es/ontology#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?activation ?label ?year ?month ?requestTime ?interventionTime ?districtLabel ?hospitalLabel ?emergencyType ?districtWikidataLink ?hospitalWikidataLink
WHERE {
  ?activation a samur:Activation ;
              rdfs:label ?label ;  
              samur:hasYear ?year ;
              samur:hasMonth ?month ;
              samur:hasRequestTime ?requestTime ;
              samur:hasInterventionTime ?interventionTime ;
              samur:hasEmergencyType ?emergencyType ;
              samur:hasDistrict ?district ;
              samur:hasHospital ?hospital .

  OPTIONAL { ?district rdfs:label ?districtLabel }
  OPTIONAL { ?hospital rdfs:label ?hospitalLabel }
  OPTIONAL { ?district owl:sameAs ?districtWikidataLink }
  OPTIONAL { ?hospital owl:sameAs ?hospitalWikidataLink }
}
ORDER BY DESC(?year) DESC(?month) DESC(?requestTime)
LIMIT 300
```

## Troubleshooting

- **SPARQL Query Fetch Errors:** Ensure Fuseki is running and that your endpoint URL is correct.
- **CORS Issues:** Configure CORS in Fuseki if necessary, or use a local proxy during development.
- **Data Format Issues:** Ensure your RDF data follows the SAMUR ontology structure as expected by the query.