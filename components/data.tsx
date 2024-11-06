interface DataProps {
  label: string
  data: string
  isLink?: boolean
  link?: string
}

const Data = ({ label, data, isLink, link }: DataProps) => {
  return (
    <div className="flex justify-between border-b">
      <p><strong>{label}</strong></p>
      {isLink ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-800 visited:text-violet-900"
        >
          {data}
        </a>
      ): (
        <p>{data}</p>
      )}
    </div>
  )
}

export default Data