import React from "react";
import {
    Banner,
    Card,
    DisplayText,
    Form,
    Frame,
    FormLayout,
    Layout,
    Page,
    PageActions,
    TextField,
    Toast,
} from '@shopify/polaris';
import store from 'store-js';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

class ProcessCreateOrder extends React.Component {
    state = {
        discount: '',
        price: '',
        variantId: '',
        showToast: false,
    };

    componentDidMount() {
        this.setState({discount: this.itemToBeConsumed()});
    }

    render() {
        console.log('go hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
    }
}