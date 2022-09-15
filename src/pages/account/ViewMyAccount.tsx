import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    IconButton,
    Tooltip,
    TextField,
    MenuItem,
    Grid,
    Button,
    Alert,
    Typography,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import '../../styles/pages/accounts.scss';
import { ChevronLeft, ExpandMore } from '@mui/icons-material';
import asyncFetchCallback from '../../../src/services/util/asyncFetchCallback';
import { User } from 'src/models/types';
import { roles } from 'src/components/account/accountTypes';
import { editUserSvc, getUserDetailsSvc, updatePasswordSvc } from 'src/services/accountService';
import { AlertType } from 'src/components/common/Alert';


const placeholderUser: User = {
    //note: id is temp holder, BE doesn't consume id on create
    id: 0,
    email: '',
    role: '',
    status: '',
    first_name: '',
    last_name: '',
    password: '',
    isVerified: true
};

const ViewMyAccount = () => {
    const navigate = useNavigate();
    let params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const [user, setUser] = useState<User>(placeholderUser);
    const [edit, setEdit] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    useEffect(() => {
        id &&
            asyncFetchCallback(
                getUserDetailsSvc(id),
                (user: User) => {
                    setUser(user);
                },
                () => {
                    //handle error here
                }
            );
    }, []);

    const userFieldOnChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        key: string
    ) => {
        setUser((paramUser: User) => {
            return {
                ...paramUser,
                [key]: event.target.value
            };
        });
    };

    const handleSaveButtonClick = (e: any) => {
        e.preventDefault();
        setLoading(true);
        asyncFetchCallback(
            editUserSvc(user!),
            () => {
                setLoading(false);
                setAlert({
                    severity: 'success',
                    message: 'Account edited.'
                });
                navigate(`/accounts/viewMyAccount?id=${id}`);
            },
            (err) => {
                setLoading(false);
                setAlert({
                    severity: 'error',
                    message: 'Error saving changes for account! Try again later.'
                });
            }
        );
    };

    const updatePassword = (e: any) => {
        e.preventDefault();
        setLoading(true);
        asyncFetchCallback(
            updatePasswordSvc(user?.email, currentPassword, newPassword),
            () => {
                setLoading(false);
                setAlert({
                    severity: 'success',
                    message: 'Password Updated.'
                });
                navigate(`/accounts/viewMyAccount?id=${id}`);
            },
            (err) => {
                setLoading(false);
                setAlert({
                    severity: 'error',
                    message: 'The password cannot be updated at this time. Try Again Later.'
                });
            }
        );
    };

    return (
        <>
            <Tooltip title='Return to Accounts' enterDelay={300}>
                <IconButton size='large' onClick={() => navigate('/accounts')}>
                    <ChevronLeft />
                </IconButton>
            </Tooltip>

            <div className='center-div'>
                <Box className='center-box'>
                    <div className="header-content">
                        <h1>Your Profile Page</h1>
                        <div className='button-group'>
                            {loading && <CircularProgress color='secondary' />}
                            {edit && (
                                <Button
                                    variant='contained'
                                    className='create-btn'
                                    color='primary'
                                    onClick={() => {
                                        setEdit(false);
                                    }}
                                >
                                    DISCARD CHANGES
                                </Button>
                            )}
                            <Button
                                variant='contained'
                                className='create-btn'
                                color='primary'
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    if (!edit) {
                                        setEdit(true);
                                    } else {
                                        handleSaveButtonClick(e);
                                        setEdit(false);
                                    }
                                }}
                            >
                                {edit ? 'SAVE CHANGES' : 'EDIT'}
                            </Button>
                        </div>
                    </div>

                    {alert && (
                        <Alert severity={alert.severity} onClose={() => setAlert(null)} style={{ margin: '1%' }}>
                            {alert.message}
                        </Alert>
                    )}
                    <Paper elevation={2}>
                        <form>
                            <div className='content-body'>
                                <div className='right-content'>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            {edit ? (
                                                <TextField
                                                    fullWidth
                                                    required
                                                    id='outlined-quantity'
                                                    label='First Name'
                                                    name='firstName'
                                                    placeholder='eg.: John'
                                                    value={user?.first_name}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        userFieldOnChange(e, 'first_name')
                                                    }
                                                />
                                            ) : (
                                                <div>
                                                    <h4>First Name</h4>
                                                    <Typography>
                                                        {user?.first_name}
                                                    </Typography>
                                                </div>
                                            )}
                                        </Grid>
                                        <Grid item xs={6}>
                                            {edit ? (
                                                <TextField
                                                    fullWidth
                                                    required
                                                    id='outlined-quantity'
                                                    label='Last Name'
                                                    name='lastName'
                                                    placeholder='eg.: Tan'
                                                    value={user?.last_name}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        userFieldOnChange(e, 'last_name')
                                                    }
                                                />
                                            ) : (
                                                <div>
                                                    <h4>Last Name</h4>
                                                    <Typography>
                                                        {user?.last_name}
                                                    </Typography>
                                                </div>
                                            )}
                                        </Grid>
                                        <Grid item xs={edit ? 12 : 6}>
                                            {edit ? (
                                                <TextField
                                                    required
                                                    fullWidth
                                                    id='outlined-quantity'
                                                    label='Email'
                                                    name='email'
                                                    placeholder='eg.: johntan@gmail.com'
                                                    value={user?.email}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        userFieldOnChange(e, 'email')
                                                    }
                                                />
                                            ) : (
                                                <div>
                                                    <h4>Email</h4>
                                                    <Typography>
                                                        {user?.email}
                                                    </Typography>
                                                </div>
                                            )}
                                        </Grid>
                                        <Grid item xs={edit ? 12 : 6}>
                                            {edit ? (
                                                <TextField
                                                    required
                                                    fullWidth
                                                    id='outlined-field'
                                                    select
                                                    label='Role'
                                                    value={user?.role}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        userFieldOnChange(e, 'role')
                                                    }
                                                >
                                                    {roles.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            ) : (
                                                <div>
                                                    <h4>Role</h4>
                                                    <Typography>
                                                        {user?.role}
                                                    </Typography>
                                                </div>
                                            )}
                                        </Grid>
                                        {!edit &&
                                            <Grid item xs={12}>
                                                <Accordion>
                                                    <AccordionSummary
                                                        expandIcon={<ExpandMore />}
                                                        aria-controls="panel1a-content"
                                                        id="panel1a-header"
                                                    >
                                                        <h4>
                                                            Change Password
                                                        </h4>

                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12}>
                                                                <Typography>
                                                                    Enter your password details below to change your password.
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    fullWidth
                                                                    required
                                                                    error={newPassword === currentPassword}
                                                                    helperText={newPassword === currentPassword ? "Current Password same as new password!" : ''}
                                                                    id='outlined-quantity'
                                                                    label='Current Password'
                                                                    name='currPwd'
                                                                    placeholder='*********'
                                                                    value={currentPassword}
                                                                    onChange={(e: any) => setCurrentPassword(e.target.value)}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    fullWidth
                                                                    required
                                                                    error={confirmPassword !== newPassword || newPassword===currentPassword}
                                                                    helperText={newPassword !== confirmPassword ? "New passwords don't match!" : ''}
                                                                    id='outlined-quantity'
                                                                    label='New Password'
                                                                    name='newPwd'
                                                                    placeholder='*********'
                                                                    value={newPassword}
                                                                    onChange={(e: any) => setNewPassword(e.target.value)}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    fullWidth
                                                                    required
                                                                    error={confirmPassword !== newPassword || confirmPassword===currentPassword}
                                                                    id='outlined-quantity'
                                                                    label='Confirm New Password'
                                                                    name='cfmNewPwd'
                                                                    placeholder='*********'
                                                                    value={confirmPassword}
                                                                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                        <Button
                                                            style={{ margin: '1%', display: 'flex', justifyContent: 'flex-end' }}
                                                            variant='contained'
                                                            className='create-btn'
                                                            color='primary'
                                                            onClick={updatePassword}
                                                            disabled={!currentPassword || !newPassword || !confirmPassword}
                                                        >
                                                            Update Password
                                                        </Button>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </Grid>
                                        }
                                    </Grid>
                                </div>
                            </div>
                        </form>
                    </Paper>
                </Box>
            </div>
        </>
    );
};

export default ViewMyAccount;
