"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Data from "./data";

interface Activation {
  activationId: string;
  year: string;
  month: string;
  requestTime: string;
  interventionTime: string;
  districtLabel: string;
  hospitalLabel: string;
  emergencyType: string;
  districtWikidataLink: string | undefined;
  hospitalWikidataLink: string | undefined;
}

interface Binding {
  label: { value: string };
  year: { value: string };
  month: { value: string };
  requestTime: { value: string };
  interventionTime: { value: string };
  districtLabel: { value: string };
  hospitalLabel: { value: string };
  emergencyType: { value: string };
  districtWikidataLink: { value: string };
  hospitalWikidataLink: { value: string };
}

const Activations = () => {
  const [activations, setActivations] = useState<Activation[]>([]);

  async function fetchSPARQL(query: string) {
    const endpoint = 'http://localhost:3030/samur-activations-complete/sparql';

    const response = await fetch(endpoint + '?query=' + encodeURIComponent(query), {
      headers: {
        'Accept': 'application/sparql-results+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch SPARQL query');
    }

    return await response.json();
  }

  const getActivations = useCallback(async () => {
    const query = `
      PREFIX samur: <http://samur.linkeddata.madrid.es/ontology#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX schema: <http://schema.org/>

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
    `;

    const data = await fetchSPARQL(query);

    return data.results.bindings.map((binding: Binding) => ({
      activationId: binding.label.value,
      year: binding.year.value,
      month: binding.month.value.replace("--", ""),
      requestTime: binding.requestTime.value,
      interventionTime: binding.interventionTime.value,
      districtLabel: binding.districtLabel ? binding.districtLabel.value : "Unknown",
      hospitalLabel: binding.hospitalLabel ? binding.hospitalLabel.value : "Unknown",
      emergencyType: binding.emergencyType.value,
      districtWikidataLink: binding.districtWikidataLink ? binding.districtWikidataLink.value : null,
      hospitalWikidataLink: binding.hospitalWikidataLink ? binding.hospitalWikidataLink.value : null,
    }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const activations = await getActivations();
      setActivations(activations);
    }
    fetchData();
  }, [getActivations]);


  return (
    <div className="w-[90%] max-w-[900px] my-10 mx-auto flex flex-col items-center gap-4">
      <h1 className="font-semibold text-xl">Latest Samur Activations</h1>
      {activations.length !== 0 ? (
        <div className="flex flex-col gap-2 w-full">
          {activations.map((activation: Activation) => (
            <div key={activation.activationId}>
              <p className="ml-2 mt-2">{activation.activationId}</p>
              <div
                className="flex flex-col border w-full rounded-lg py-3 px-4 shadow-sm space-y-2"
              >
                <Data label="Year" data={activation.year} />
                <Data label="Month" data={activation.month} /> 
                <Data label="Request Time" data={activation.requestTime} />
                <Data label="Intervention Time" data={activation.interventionTime} />
                <Data label="Emergency Type" data={activation.emergencyType} />
                <Data label="District" data={activation.districtLabel} isLink link={activation.districtWikidataLink} />
                <Data label="Hospital" data={activation.hospitalLabel} isLink link={activation.hospitalWikidataLink} />
              </div>
            </div>
          ))}
        </div>) : (
          <div className="w-[50px] mt-10 h-full flex flex-col items-center justify-center">
            <Image src="/bars-rotate-fade.svg" alt="Loader" width={50} height={50} className="w-auto h-auto"/>
          </div>
      )
      }
    </div>
  )
}

export default Activations;