import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useEffect, useState } from 'react';

export const LineChartX = ({chartDates,selectedChart,moucheData,thripsData,mineusesData }) => {

   
    const [adjustedChartDates, setadjustedChartDates] = useState(null);

    useEffect(() => {
      const adjustChartDates = () => {
        if (!chartDates) return;
    
        const ranges = [
          { max: 7, interval: 1 },   // Show all labels when <= 7 dates
          { max: 30, interval: 5 },  // Every 5th label for 8-30 dates
          { max: 55, interval: 7 },  // Every 7th label for 31-40 dates
          { max: 100, interval: 10 }, // Every 10th label for 55-100 dates
          { max: 200, interval: 40 }, // Every 10th label for 55-100 dates
          { max: 300, interval: 50 }, // Every 10th label for 55-100 dates
          { max: 400, interval: 60 }, // Every 10th label for 55-100 dates
          { max: 500, interval: 70 }, // Every 10th label for 55-100 dates
          { max: Infinity, interval: 100 } // Every 15th label for 100+ dates
        ];
    
        // Find the appropriate range
        const { interval } = ranges.find(range => chartDates.length <= range.max);
    
        // Adjust `chartDates` based on the interval
        const adjustedDates = chartDates.map((label, index) => (index % interval === 0 ? label : ""));
        setadjustedChartDates(adjustedDates);
      };
    
      adjustChartDates();
    }, [chartDates]); 
    
  

    return (
        <>
        {
            adjustedChartDates !== null && chartDates && selectedChart && moucheData && thripsData && mineusesData && 
            <LineChart
                data={{
                  labels: adjustedChartDates,  
                  datasets: [
                    {
                      data: selectedChart === 'Mouches' 
                        ? moucheData.map(item => item.count) 
                        : selectedChart === 'Thrips' 
                          ? thripsData.map(item => item.count) 
                          : mineusesData.map(item => item.count), 
                      color: (opacity = 1) => `#487C15`, // Line color
                      strokeWidth: 1.2, // Line thickness
                    }
                  ],
                }}
                width={Dimensions.get('window').width - 5} // Chart width
                height={350} 
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: 'white',
                  backgroundGradientTo: 'white',
                  decimalPlaces: 0, // Display without decimals
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Color of the axis labels
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '0',
                    stroke: '#487C15'  
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  marginLeft: -25,
                }}
            />
        }
        </>
    );
  };
  