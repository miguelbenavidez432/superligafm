import { useState, useEffect } from 'react';
import axiosClient from '../../axios';
import { Link } from 'react-router-dom';
import Team from '../views/Teams';

export default function PublicTeams() {
    return <Team/>
}
