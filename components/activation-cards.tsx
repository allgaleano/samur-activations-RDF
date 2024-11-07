import { Activation } from '@/types'
import Data from './data'

interface ActivationCardsProps {
  activations: Activation[];
  error: boolean;
}

const ActivationCards = ({
  activations,
  error,
}: ActivationCardsProps) => {
  return (
    <div className="w-full flex justify-center items-center">
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
                <Data label="District" data={activation.districtLabel} hasLink link={activation.districtWikidataLink} />
                <Data label="Hospital" data={activation.hospitalLabel} hasLink link={activation.hospitalWikidataLink} />
              </div>
            </div>
          ))}
        </div>) : (
        error ? (
          <div>
            <p className="text-destructive">Failed to fetch data</p>
          </div>
        ) : (
          <div>
            <p className="text-primary">No results</p>
          </div>
        )
      )}
    </div>
  )
}

export default ActivationCards