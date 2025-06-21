import React, { useEffect, useState } from 'react';
import { Option } from '@/components/ui/multiple-selector';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Label } from "@/components/ui/label"

interface CrimenOrgGaugeProps {
  selectedParams: Option[];
  totalParams: Option[];
}

const CrimenOrgGauge: React.FC<CrimenOrgGaugeProps> = ({
  selectedParams,
  totalParams,
}) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (totalParams.length > 0) {
      const newPercentage = (selectedParams.length / totalParams.length) * 100;
      setPercentage(newPercentage);
    }
  }, [selectedParams, totalParams]);

  const getColor = (percent: number) => {
    if (percent >= 75) return "#ef4444"; // Rojo   
    if (percent >= 50) return "#f97316"; // Naranja
    if (percent >= 25) return "#ffdf00"; // amarrillito pasando a Naranja
    return "#008000"   ; // verdecito
  };

  const data = [
    {
      name: 'Porcentaje',
      value: percentage,
    },
  ];

  return (
    <div className="relative w-full max-w-[250px] h-[200px] mx-auto">
       
      <RadialBarChart 
        width={150}
        height={200}
        innerRadius="90%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
          fill={getColor(percentage)}
        />
        <text
          x="50%"
          y="30%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current font-bold text-2xl"
        >
          {Math.round(percentage)}%  


        </text>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="bottom"
          style={{ 
            fontSize: '10px'   
          }}
          >
          Perfil Crimen Org.


        </text>
      </RadialBarChart>
     
    </div>
  );
};

export default CrimenOrgGauge