import { HelpOutline } from '@mui/icons-material';
import { Card, Divider, Tooltip } from '@mui/material';
import { Chart as ChartJS, registerables } from 'chart.js';
import _ from 'lodash';
import { Bar } from 'react-chartjs-2';
import { SalesBestseller } from 'src/models/types';
import HeaderTooltip from 'src/components/common/HeaderTooltip';

ChartJS.register(...registerables);

type RevenueChartProps = {
  bestSellers: SalesBestseller[];
};

const ProductSales = ({ bestSellers }: RevenueChartProps) => {
  const data = {
    labels: bestSellers.map((product) => product.productname),
    datasets: [
      {
        label: 'Quantity',
        data: bestSellers.map((product) => product.quantity),
        barPercentage: 0.5,
        borderRadius: 5,
        backgroundColor: '#DAD7FE'
      }
    ]
  };

  const options = {
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          callback: (value: any) => {
            return _.truncate(bestSellers[value].productname, { length: 9 });
          }
        }
      },
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        display: false
      }
    }
  };

  return (
    <Card style={{ padding: '0.5em 2em 2em', height: '48vh' }}>
      <HeaderTooltip
        title={'Best Selling Products'}
        tooltipText={'Best selling items for TKG'}
      />
      <Divider className='full-divider' />
      <Bar data={data} options={options} />
    </Card>
  );
};

export default ProductSales;
