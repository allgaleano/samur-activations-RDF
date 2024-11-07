export async function fetchSPARQL(query: string) {
  const endpoint = 'http://localhost:3030/samur-activations-complete/sparql';
  try {
    const response = await fetch(endpoint + '?query=' + encodeURIComponent(query), {
      headers: {
        'Accept': 'application/sparql-results+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch SPARQL query');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}