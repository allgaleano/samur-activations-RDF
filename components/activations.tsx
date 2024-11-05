import { useEffect, useState } from "react";

const Activations = () => {
  const [activations, setActivations] = useState([]);

  async function fetchSPARQL(query: string) {
    const endpoint = 'http://localhost:3030/samur-activations-complete/sparql'; 

    const response = await fetch(endpoint + '?query=' + encodeURIComponent(query), {
      headers: {
        'Accept': 'application/sparql-results+json',
      },
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async function getActivations() {
    const query = `
    PREFIX samur: <http://samur.linkeddata.madrid.es/ontology#>

    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    SELECT ?activation ?year ?month ?requestTime ?interventionTime ?hospital ?emergencyType ?wikidataLink
    WHERE {
      ?activation a samur:Activation ;
                  samur:hasYear ?year ;
                  samur:hasMonth ?month ;
                  samur:hasRequestTime ?requestTime ;
                  samur:hasInterventionTime ?interventionTime ;
                  samur:hasEmergencyType ?emergencyType .
                  
      OPTIONAL { ?activation samur:hasHospital ?hospital }
      OPTIONAL { ?activation owl:sameAs ?wikidataLink }
    }
    LIMIT 300
    `;

    const data = await fetchSPARQL(query);

    return data.results.bindings.map((binding: any) => ({
      activation: binding.activation.value,
      year: binding.year.value,
      month: binding.month.value,
      requestTime: binding.requestTime.value,
      interventionTime: binding.interventionTime.value,
      hospital: binding.hospital ? binding.hospital.value : null,
      emergencyType: binding.emergencyType.value,
      wikidataLink: binding.wikidataLink ? binding.wikidataLink.value : null,
    }));
  }

  useEffect(() => {
    const fetchData = async () => {
      const activations = await getActivations();
      setActivations(activations);
    }
    fetchData();
  }, []);


  return (
    <div className="w-[90%] max-w-[900px] h-full my-10 mx-auto flex flex-col items-center gap-4">
      <h1 className="font-semibold text-xl">Latest Activations</h1>
      {activations.length !== 0 ? (
        <div className="flex flex-col gap-2">
          {activations.map((activation: any, index) => (
            <div
              key={`${activation.activation}-${index}`}
              className="flex flex-col border w-full rounded-lg py-3 px-4 shadow-sm"
            >
              <p><strong>Activation:</strong> {activation.activation}</p>
              <p><strong>Year:</strong> {activation.year}</p>
              <p><strong>Month:</strong> {activation.month}</p>
              <p><strong>Request Time:</strong> {activation.requestTime}</p>
              <p><strong>Intervention Time:</strong> {activation.interventionTime}</p>
              <p><strong>District:</strong> {activation.wikidataLink && (
                <a href={activation.wikidataLink} target="_blank" rel="noopener noreferrer">
                  View on Wikidata
                </a>
              )}</p>
              {activation.hospital && <p><strong>Hospital:</strong> {activation.hospital}</p>}
              <p><strong>Emergency Type:</strong> {activation.emergencyType}</p>
            </div>
          ))}
        </div> ) : (
          <p>Loading...</p>
        )
      }
    </div>
  )
}

export default Activations;