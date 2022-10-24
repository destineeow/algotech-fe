import {
  ListItem,
  ListItemIcon,
  ListItemText,
  TypographyProps
} from '@mui/material';
import React from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  useLocation
} from 'react-router-dom';

type ListItemLinkProps = {
  icon?: React.ReactElement;
  primary: string;
  to: string;
  typographyProps?: TypographyProps;
  disabled?: boolean;
  suffix?: React.ReactNode;
};

const ListItemLink = ({
  icon,
  primary,
  to,
  typographyProps = {},
  disabled = false,
  suffix
}: ListItemLinkProps) => {
  const location = useLocation();
  const renderLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(
        (itemProps, ref) => {
          return (
            <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />
          );
        }
      ),
    [to]
  );

  return (
    <li>
      <ListItem
        button
        disabled={disabled}
        component={renderLink}
        selected={location.pathname === to}
      >
        <ListItemIcon>{icon && icon}</ListItemIcon>
        <ListItemText
          primary={primary}
          primaryTypographyProps={{ ...typographyProps, fontSize: '0.8em' }}
        />
        {suffix && suffix}
      </ListItem>
    </li>
  );
};

export default ListItemLink;
