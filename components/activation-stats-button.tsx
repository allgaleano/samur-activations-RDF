import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Image from 'next/image';
import { X } from 'lucide-react';
import { fetchSPARQL } from '@/lib/fetchSPARQL';
import { DistrictBinding, HospitalBinding } from '@/types';

interface StatsModalProps {
  title: string;
  data: { name: string; incidents: number }[];
  onClose: () => void;
}

const StatsModal = ({ title, data, onClose }: StatsModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-5xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="h-[600px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={(value) => value.toLocaleString()} 
              tick={{ fontSize: 11 }} 
              domain={[0, 'dataMax']}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              width={200}
              tick={{ 
                fontSize: 11, 
                fill: '#374151',
                textAnchor: 'end', 
                dy: 4 
              }}
            />
            <Tooltip 
              formatter={(value: number) => value.toLocaleString()} 
              labelStyle={{ color: '#374151' }}
            />
            <Bar 
              dataKey="incidents" 
              fill="#3b82f6" 
              barSize={15}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const ActivationStatsButtons = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showDistrictStats, setShowDistrictStats] = useState(false);
  const [showHospitalStats, setShowHospitalStats] = useState(false);
  const [districtStats, setDistrictStats] = useState([]);
  const [hospitalStats, setHospitalStats] = useState([]);

  const fetchDistrictStats = useCallback(async () => {
    const query = `
      PREFIX samur: <http://samur.linkeddata.madrid.es/ontology#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT ?districtLabel (COUNT(?activation) AS ?activationCount)
      WHERE {
        ?activation a samur:Activation ;
                    samur:hasDistrict ?district .
        ?district rdfs:label ?districtLabel .
      }
      GROUP BY ?districtLabel
      ORDER BY DESC(?activationCount)
    `;

    const data = await fetchSPARQL(query);
    if (data === null) {
      setError(true);
      return [];
    }
    
    return data.results.bindings.map((binding: DistrictBinding) => ({
      name: binding.districtLabel.value,
      incidents: parseInt(binding.activationCount.value)
    }));
  }, []);

  const fetchHospitalStats = useCallback(async () => {
    const query = `
      PREFIX samur: <http://samur.linkeddata.madrid.es/ontology#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT ?hospitalLabel (COUNT(?activation) AS ?activationCount)
      WHERE {
        ?activation a samur:Activation ;
                    samur:hasHospital ?hospital .
        ?hospital rdfs:label ?hospitalLabel .
      }
      GROUP BY ?hospitalLabel
      ORDER BY DESC(?activationCount)
    `;

    const data = await fetchSPARQL(query);
    if (data === null) {
      setError(true);
      return [];
    }

    return data.results.bindings.map((binding: HospitalBinding) => ({
      name: binding.hospitalLabel.value.replace('Hospital ', ''),
      incidents: parseInt(binding.activationCount.value)
    }));
  }, []);

  const handleDistrictStats = async () => {
    setLoading(true);
    const data = await fetchDistrictStats();
    setDistrictStats(data);
    setShowDistrictStats(true);
    setLoading(false);
  };

  const handleHospitalStats = async () => {
    setLoading(true);
    const data = await fetchHospitalStats();
    setHospitalStats(data);
    setShowHospitalStats(true);
    setLoading(false);
  };

  return (
    <div className="w-full flex gap-2">
      <button
        onClick={handleDistrictStats}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        View District Stats
      </button>
      
      <button
        onClick={handleHospitalStats}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        View Hospital Stats
      </button>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Image src="/bars-rotate-fade.svg" alt="Loading" width={50} height={50} className="w-[50px] h-auto" />
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-red-500">Error loading statistics. Please try again later.</p>
            <button 
              onClick={() => setError(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDistrictStats && (
        <StatsModal
          title="Incidents by District"
          data={districtStats}
          onClose={() => setShowDistrictStats(false)}
        />
      )}

      {showHospitalStats && (
        <StatsModal
          title="Incidents by Hospital"
          data={hospitalStats}
          onClose={() => setShowHospitalStats(false)}
        />
      )}
    </div>
  );
};

export default ActivationStatsButtons;