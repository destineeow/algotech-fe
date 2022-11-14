import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Button, IconButton, Tooltip } from '@mui/material';
import '../../styles/pages/accounts.scss';
import { ChevronLeft } from '@mui/icons-material';
import asyncFetchCallback from '../../services/util/asyncFetchCallback';
import { DiscountCode } from 'src/models/types';
import TimeoutAlert, { AlertType } from '../../components/common/TimeoutAlert';
import { getDiscountCodeDetailsSvc } from 'src/services/discountCodeService';
import DiscountInfoGrid from 'src/components/discounts/DiscountInfoGrid';
import DiscountEditButtonGrp from 'src/components/discounts/DiscountEditButtonGrp';
import DiscountEditGrid from 'src/components/discounts/DiscountEditGrid';

const DiscountCodeDetails = () => {
  let params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState<DiscountCode>();
  const [editDiscountCode, setEditDiscountCode] = useState<DiscountCode>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [edit, setEdit] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertType | null>(null);

  useEffect(() => {
    setLoading(true);
    id &&
      asyncFetchCallback(
        getDiscountCodeDetailsSvc(id),
        (discountCode: DiscountCode) => {
          if (discountCode) {
            setDiscountCode(discountCode);
            setEditDiscountCode(discountCode);
            setLoading(false);
          } else {
            setAlert({
              severity: 'error',
              message:
                'Discount code does not exist. You will be redirected back to the Discount Codes.'
            });
            setLoading(false);
            setTimeout(() => navigate('/discountCode/allDiscountCodes'), 3500);
          }
        }
      );
  }, [id, navigate]);

  return (
    <>
      <Tooltip title='Return to Discount Codes' enterDelay={300}>
        <IconButton
          size='large'
          onClick={() => navigate('/discountCode/allDiscountCodes')}
        >
          <ChevronLeft />
        </IconButton>
      </Tooltip>

      <div className='center-div'>
        <Box className='center-box'>
          <div className='header-content'>
            <h1>View Discount Code</h1>
            <DiscountEditButtonGrp
              id={id!}
              loading={loading}
              edit={edit}
              discountCode={discountCode!}
              editDiscountCode={editDiscountCode!}
              setEditDiscountCode={() => setEditDiscountCode(discountCode!)}
              setEdit={setEdit}
              setLoading={setLoading}
              setAlert={setAlert}
              setDiscountCode={setDiscountCode}
              viewPath='/discountCode/discountCodeDetail'
              deletePath='/discountCode/allDiscountCodes'
            />
          </div>
          <TimeoutAlert alert={alert} clearAlert={() => setAlert(null)} />
          <Paper elevation={2}>
            <div className='content-body'>
              <div className='right-content'>
                {edit
                  ? editDiscountCode && (
                      <DiscountEditGrid
                        discountCode={discountCode!}
                        editDiscountCode={editDiscountCode!}
                        setEditDiscountCode={setEditDiscountCode}
                      />
                    )
                  : discountCode && (
                      <DiscountInfoGrid
                        discountCode={discountCode}
                        loading={loading}
                      />
                    )}
              </div>
            </div>
            <div className='view-button-group'>
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  navigate(-1);
                }}
              >
                Back
              </Button>
            </div>
          </Paper>
        </Box>
      </div>
    </>
  );
};

export default DiscountCodeDetails;
