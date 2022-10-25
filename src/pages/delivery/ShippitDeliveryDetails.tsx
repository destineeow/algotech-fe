import React from 'react';
import { useNavigate } from 'react-router';
import {
  Tooltip,
  IconButton,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Grid,
  Paper,
  Backdrop,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useSearchParams } from 'react-router-dom';
import {
  bookShippitDelivery,
  cancelShippitDelivery,
  confirmShippitOrder,
  getDeliveryOrderByTracking,
  getShippitBookingLabel,
  getShippitLabel
} from 'src/services/deliveryServices';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import { DeliveryOrder } from 'src/models/types';
import moment from 'moment';
import TimeoutAlert, { AlertType } from 'src/components/common/TimeoutAlert';
import ConfirmationModal from 'src/components/common/ConfirmationModal';

const steps = [
  {
    label: 'Order placed',
    status: 'order_placed'
  },
  {
    label: 'Packing order',
    status: 'despatch_in_progress'
  },
  {
    label: 'Booked for delivery',
    status: 'ready_for_pickup'
  },
  {
    label: 'Out for delivery',
    status: 'untrackable'
  }
];

const ShippitDeliveryDetails = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [deliveryOrder, setDeliveryOrder] = React.useState<DeliveryOrder>();
  const [trackingUrl, setTrackingUrl] = React.useState<string>('');
  const [alert, setAlert] = React.useState<AlertType | null>(null);
  const [confirmDeliveryModalOpen, setConfirmDeliveryModalOpen] =
    React.useState<boolean>(false);
  const [bookDeliveryModalOpen, setBookDeliveryModalOpen] =
    React.useState<boolean>(false);
  const [cancelDeliveryModalOpen, setCancelDeliveryModalOpen] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    setLoading(true);

    if (id) {
      asyncFetchCallback(
        getDeliveryOrderByTracking(id),
        (res) => {
          setDeliveryOrder(res);
          setTrackingUrl('https://app.staging.shippit.com/tracking/' + id);

          if (deliveryOrder?.deliveryStatus?.status !== 'cancelled') {
            setActiveStep(
              steps.findIndex(
                (step) => step.status === res.deliveryStatus?.status
              )
            );
          } else {
            setActiveStep(-1);
          }
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
  }, [id, deliveryOrder?.deliveryStatus?.status]);

  const openTracking = async () => {
    window.open(trackingUrl, '_blank');
  };

  const handleConfirmOrder = async () => {
    setConfirmDeliveryModalOpen(false);
    setLoading(true);

    await asyncFetchCallback(
      confirmShippitOrder(id!),
      (res) => {
        setAlert({
          severity: 'success',
          message: 'Shippit Order confirmed successfully.'
        });
        asyncFetchCallback(getDeliveryOrderByTracking(id!), (res) => {
          setDeliveryOrder(res);
          setActiveStep(
            steps.findIndex(
              (step) => step.status === res.deliveryStatus?.status
            )
          );
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setAlert({
          severity: 'error',
          message: 'Shippit Order could not be confirmed successfully.'
        });
      }
    );
  };

  const handleDownloadShippitLabel = async () => {
    setLoading(true);

    await asyncFetchCallback(getShippitLabel(id!), (res) => {
      if (res) {
        window.open(res, '_blank');
      }
      setLoading(false);
    });
  };

  const handleDownloadShippitBookingLabel = async () => {
    setLoading(true);

    await asyncFetchCallback(getShippitBookingLabel(id!), (res) => {
      if (res) {
        window.open(res, '_blank');
      }
      setLoading(false);
    });
  };

  const handleCancelShippitDelivery = async () => {
    setCancelDeliveryModalOpen(false);
    setLoading(true);

    await asyncFetchCallback(
      cancelShippitDelivery(id!),
      (res) => {
        let updatedDeliveryStatus = Object.assign(
          {},
          deliveryOrder?.deliveryStatus,
          { status: 'cancelled' }
        );

        setDeliveryOrder((deliveryOrder) => {
          if (deliveryOrder) {
            return {
              ...deliveryOrder,
              deliveryStatus: updatedDeliveryStatus
            };
          } else {
            return deliveryOrder;
          }
        });
        setAlert({
          severity: 'success',
          message: 'Shippit Order cancelled successfully.'
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setAlert({
          severity: 'error',
          message: 'Shippit Order could not be cancelled successfully.'
        });
      }
    );
  };

  const handleBookShippitDelivery = async () => {
    setBookDeliveryModalOpen(false);
    setLoading(true);

    await asyncFetchCallback(
      bookShippitDelivery(id!),
      (res) => {
        setAlert({
          severity: 'success',
          message: 'Shippit Order booked successfully.'
        });
        asyncFetchCallback(getDeliveryOrderByTracking(id!), (res) => {
          setDeliveryOrder(res);
          setActiveStep(
            steps.findIndex(
              (step) => step.status === res.deliveryStatus?.status
            )
          );
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setAlert({
          severity: 'error',
          message: 'Shippit Order could not be booked successfully.'
        });
      }
    );
  };

  return (
    <div className='view-delivery-details'>
      <div className='view-delivery-details-top-section'>
        <div className='delivery-details-section-header'>
          <Tooltip title='Return to Previous Page' enterDelay={300}>
            <IconButton size='large' onClick={() => navigate(-1)}>
              <ChevronLeft />
            </IconButton>
          </Tooltip>
          <h1>View Shippit Delivery</h1>
          {deliveryOrder?.deliveryStatus?.status === 'cancelled' && (
            <div className='shippit-order-cancelled-chip-container'>
              <Chip
                label='Delivery Cancelled'
                style={{ backgroundColor: '#D9D9D9', fontFamily: 'Poppins' }}
              />
            </div>
          )}
        </div>
        <div className='track-order-button-container'>
          <Button
            variant='contained'
            startIcon={<LocalShippingIcon />}
            onClick={openTracking}
          >
            Track Order
          </Button>
          {deliveryOrder?.deliveryStatus?.status === 'order_placed' && (
            <Button
              variant='contained'
              onClick={() => setCancelDeliveryModalOpen(true)}
            >
              Cancel Order
            </Button>
          )}
          <ConfirmationModal
            open={cancelDeliveryModalOpen}
            onClose={() => setCancelDeliveryModalOpen(false)}
            onConfirm={handleCancelShippitDelivery}
            title='Cancel Shippit Delivery'
            body='Are you sure you want to cancel the delivery order? This action cannot be reversed.'
          />
        </div>
      </div>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={loading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
      {alert && (
        <div className='delivery-details-alert'>
          <TimeoutAlert
            alert={alert}
            timeout={6000}
            clearAlert={() => setAlert(null)}
          />
        </div>
      )}
      <div className='shippit-delivery-details-stepper'>
        <Stepper activeStep={activeStep} orientation='vertical'>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography>
                  Date: {deliveryOrder?.deliveryStatus?.date}
                </Typography>
                <Typography>
                  Time: {deliveryOrder?.deliveryStatus?.timestamp}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </div>
      <div className='delivery-detail-cards'>
        <Paper elevation={2} className='delivery-address-card'>
          <div className='delivery-address-grid'>
            <h3 className='labelText'>Delivery Address</h3>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <h4 className='labelText'>Name</h4>
                <Typography>
                  {deliveryOrder?.salesOrder.customerName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <h4 className='labelText'>Address</h4>
                <Typography>
                  {deliveryOrder?.salesOrder.customerAddress}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <h4 className='labelText'>Country</h4>
                <Typography>Singapore</Typography>
              </Grid>
              <Grid item xs={6}>
                <h4 className='labelText'>Postal Code</h4>
                <Typography> {deliveryOrder?.salesOrder.postalCode}</Typography>
              </Grid>
            </Grid>
          </div>
        </Paper>
        <Paper elevation={2} className='delivery-mode-card'>
          <div className='delivery-address-grid'>
            <h3 className='labelText'>Delivery Details</h3>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <h4 className='labelText'>Delivery Mode</h4>
                <Typography>{deliveryOrder?.deliveryMode}</Typography>
              </Grid>
              {/* <Grid item xs={6}>
                <h4 className='labelText'>Carrier</h4>
                <Typography>{deliveryOrder?.carrier}</Typography>
              </Grid> */}
              <Grid item xs={6}>
                <h4 className='labelText'>Estimated Delivery Date</h4>
                <Typography>
                  {moment(deliveryOrder?.deliveryDate).format('DD-MM-YYYY')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <h4 className='labelText'>Tracking Number</h4>
                <Typography>{deliveryOrder?.shippitTrackingNum}</Typography>
              </Grid>
            </Grid>
            <div className='delivery-actions-button-container'>
              {deliveryOrder?.deliveryStatus?.status === 'order_placed' && (
                <Button
                  variant='contained'
                  size='medium'
                  sx={{ height: 'fit-content' }}
                  onClick={() => setConfirmDeliveryModalOpen(true)}
                >
                  Confirm Shippit Order
                </Button>
              )}
              {deliveryOrder?.deliveryStatus?.status ===
                'despatch_in_progress' && (
                <Button
                  variant='contained'
                  size='medium'
                  sx={{ height: 'fit-content' }}
                  onClick={handleDownloadShippitLabel}
                >
                  Get Shippit Label
                </Button>
              )}
              {deliveryOrder?.deliveryStatus?.status ===
                'despatch_in_progress' && (
                <Button
                  variant='contained'
                  size='medium'
                  sx={{ height: 'fit-content' }}
                  onClick={() => setBookDeliveryModalOpen(true)}
                >
                  Book Shippit Delivery
                </Button>
              )}
              {(deliveryOrder?.deliveryStatus?.status === 'ready_for_pickup' ||
                deliveryOrder?.deliveryStatus?.status === 'untrackable') && (
                <Button
                  variant='contained'
                  size='medium'
                  sx={{ height: 'fit-content' }}
                  onClick={handleDownloadShippitBookingLabel}
                >
                  Get Booking Label
                </Button>
              )}
              <ConfirmationModal
                open={confirmDeliveryModalOpen}
                onClose={() => setConfirmDeliveryModalOpen(false)}
                onConfirm={handleConfirmOrder}
                title='Confirm Shippit Delivery'
                body='Are you sure you want to confirm the delivery order? This action cannot be reversed.'
              />
              <ConfirmationModal
                open={bookDeliveryModalOpen}
                onClose={() => setBookDeliveryModalOpen(false)}
                onConfirm={handleBookShippitDelivery}
                title='Book Shippit Order'
                body='Are you sure you want to book the Shippit order? This action cannot be reversed.'
              />
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default ShippitDeliveryDetails;
