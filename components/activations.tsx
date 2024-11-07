"use client";

import { useCallback, useEffect, useState } from "react";
import { Activation, Binding } from "@/types";
import { Button } from "./ui/button";
import ActivationCards from "./activation-cards";
import { fetchSPARQL } from "@/lib/fetchSPARQL";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import ActivationStatsButtons from "./activation-stats-button";


const Activations = () => {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const getActivations = useCallback(async (search = "") => {
    setLoading(true);
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

        ${search ? `
          FILTER(CONTAINS(LCASE(?districtLabel), LCASE("${search}")) ||
                 CONTAINS(LCASE(?hospitalLabel), LCASE("${search}")) ||
                 CONTAINS(LCASE(?emergencyType), LCASE("${search}")))
        ` : ""}
      }
      ORDER BY DESC(?year) DESC(?month) DESC(?requestTime)
      LIMIT 300
    `;

    const data = await fetchSPARQL(query);

    if (data === null) {
      setError(true);
      setLoading(false);
      return [];
    }

    setError(false);
    setLoading(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activations = await getActivations(searchTerm);
    setActivations(activations);
  };

  return (
    <div className="w-[90%] max-w-[900px] py-10 mx-auto flex flex-col items-center gap-4">
      <h1 className="font-semibold text-xl">Latest Samur Activations</h1>
      <div className="flex w-full items-center gap-2">
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2 items-center">
          <input 
            type="text" 
            placeholder="Search by district, hospital, or emergencyType" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full border rounded-md py-2 px-3 "
          />
          <Button type="submit" variant="outline" className="h-[42px]">
            <FaSearch />
          </Button>
        </form>
        <div className="flex-shrink-0">
          <ActivationStatsButtons />
        </div>
      </div>
      {loading ? (
        <div className="w-[50px] mt-10 h-full flex flex-col items-center justify-center">
          <Image src="/bars-rotate-fade.svg" alt="Loader" width={50} height={50} className="w-auto h-auto" />
        </div>
      ): (
        <ActivationCards activations={activations} error={error}  />
      )}
    </div>
  )
}

export default Activations;