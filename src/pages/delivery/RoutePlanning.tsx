import React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import ManualDeliveryCellAction from 'src/components/delivery/ManualDeliveryCellAction';
import '../../styles/pages/inventory/inventory.scss';
import '../../styles/common/common.scss';
import '../../styles/pages/delivery/delivery.scss'
import {
  TextField,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RouteIcon from '@mui/icons-material/Route';
import { DeliveryOrder, OrderStatus } from '../../models/types';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import {
  getPlannedRoute,
  getCurrentLocationLatLng
} from 'src/services/deliveryServices';
import AuthContext from 'src/context/auth/authContext';
import moment, { Moment } from 'moment';
import TimeoutAlert, { AlertType } from 'src/components/common/TimeoutAlert';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import RoutePlanningOrderStatusCell from 'src/components/delivery/RoutePlanningOrderStatusCell';

const columns: GridColDef[] = [
  {
    field: 'stopOrder',
    headerName: 'Sequence',
    flex: 0.5,
    valueGetter: (params) => {
      return 'Stop ' + params.row.stopOrder;
    }
  },
  {
    field: 'salesOrderId',
    headerName: ' Sales Order ID',
    flex: 1,
    valueGetter: (params: GridValueGetterParams) => params.row.order?.orderId
  },
  {
    field: 'orderStatus',
    headerName: 'Delivery Status',
    flex: 1,
    renderCell: RoutePlanningOrderStatusCell,
    valueGetter: (params) => {
      let orderStatus = params.row.order?.orderStatus;
      let deliveryStatus = params.row.deliveryStatus?.status;
      let cell;

      if (deliveryStatus === 'cancelled') {
        cell = 'Cancelled';
        return cell;
      }

      if (orderStatus === OrderStatus.READY_FOR_DELIVERY) {
        cell = 'Delivery Scheduled';
      } else if (orderStatus === OrderStatus.SHIPPED) {
        cell = 'Shipped';
      } else {
        cell = 'Completed';
      }

      return cell;
    }
  },
  {
    field: 'salesOrder',
    headerName: 'Address',
    flex: 1,
    valueGetter: (params: GridValueGetterParams) =>
      params.row.order?.customerAddress
  },
  {
    field: 'action',
    headerName: 'Action',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    renderCell: ManualDeliveryCellAction
  }
];

const RoutePlanning = () => {
  const [tableData, setTableData] = React.useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingRoute, setLoadingRoute] = React.useState<boolean>(false);
  const [address, setAddress] = React.useState<any>();
  const [currentLocation, setCurrentLocation] = React.useState<string>();
  const authContext = React.useContext(AuthContext);
  const { user } = authContext;
  const [alert, setAlert] = React.useState<AlertType | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Moment | null>(
    moment()
  );

  const findCurrentLocation = (event: React.MouseEvent<HTMLElement>) => {
    setLoading(true);
    asyncFetchCallback(
      getCurrentLocationLatLng({ address: currentLocation }),
      (res) => {
        setLoading(false);
        setAddress(res);
        if (res.length === 0) {
          setAlert({
            severity: 'error',
            message: 'Starting location invalid, please try again!'
          });
        } else {
          setAlert({
            severity: 'success',
            message: 'Starting location set successfully.'
          });
        }
      }
    );
  };

  const planRoute = (event: React.MouseEvent<HTMLElement>) => {
    setLoadingRoute(true);
    asyncFetchCallback(
      getPlannedRoute(selectedDate, user?.id, currentLocation),
      (res) => {
        setLoadingRoute(false);
        var newRes = res.slice(1, -1);
        setTableData(newRes.map((order, index) => ({...order, stopOrder: index + 1 })));
        if (res.length === 0) {
          setAlert({
            severity: 'error',
            message: 'Route planning failed, please try again!'
          });
        } else {
          setAlert({
            severity: 'success',
            message: 'Route planning is successfully.'
          });
        }
      }
    );
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLocation(e.target.value);
  };

  return (
    <div className='delivery-orders'>
      <Stack
        direction='row'
        width='100%'
        alignItems='center'
        justifyContent='space-between'
      >
        <h1>Route Planner</h1>
        <Stack direction='row' spacing={2}>
          <Typography className='date-picker-text'>
            Plan route for deliveries on
          </Typography>
          <DesktopDatePicker
            label='Delivery Date'
            value={selectedDate}
            minDate={moment()}
            onChange={(date) => setSelectedDate(moment(date))}
            renderInput={(params) => (
              <TextField style={{ width: 250 }} required {...params} />
            )}
          />
        </Stack>
      </Stack>
      <br/>
      {alert && (
        <TimeoutAlert
          alert={alert}
          timeout={5000}
          clearAlert={() => setAlert(null)}
        />
      )}
      <div className='search-bar'>
        <MyLocationIcon />
        <TextField
          id='search'
          type='number'
          label='Enter your starting postal code'
          margin='normal'
          fullWidth
          onChange={handleLocationChange}
        />
        <Button
          variant='contained'
          size='small'
          sx={{ height: 'fit-content' }}
          color='primary'
          onClick={findCurrentLocation}
        >
          Set Current Location
        </Button>
        {loading && <CircularProgress color='secondary' />}
      </div>
      <br/>
      {address && (
        <div className='address-bar'>
          <Typography>
            Your starting address is :  
          </Typography>
          <Chip 
            label={address.ADDRESS}
            style={{ backgroundColor: '#ADD8E6', fontFamily: 'Poppins' }}
            sx={{ borderRadius : 2, mx : 2 }}
          />
          <Button
            variant='contained'
            size='small'
            sx={{ height: 'fit-content' }}
            color='primary'
            endIcon = {<RouteIcon />}
            onClick={planRoute}
          >
            Plan Route
          </Button>
        </div>
      )}
      <br/>
      <DataGrid
        columns={columns}
        rows={tableData}
        autoHeight
        loading={loadingRoute}
      />
    </div>
  );
};

export default RoutePlanning;
