import { Radium } from 'common/radium';
import * as React from 'react';
import { NavLink as LinkOrig, NavLinkProps } from 'react-router-dom';

const RadiumLink = Radium(LinkOrig);

export let Link = (props: NavLinkProps) => {
    return <RadiumLink {...props} activeClassName='active' />;
};
