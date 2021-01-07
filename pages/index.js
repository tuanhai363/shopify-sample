import React, { useCallback, useState } from 'react';
import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import {FormLayout, Form, TextField, Button} from '@shopify/polaris';
import store from 'store-js';
import ResourceListWithProducts from '../components/ResourceList';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            api_key: '',
            api_secret: '',
        };
    }

    render() {
        const emptyState = !store.get('ids');
        console.log(emptyState, '<<><><><>EMPTY STATE')
        console.log(this.state.api_key, 'EMAIl')
        return (
            <Page>
                <TitleBar
                    title="Ninja Van Shipper Account"
                    primaryAction={{
                        content: 'Select products',
                        onAction: () => this.setState(
                            { open: true },
                            () => {
                                console.log(this.state.open, '>>>>>');
                            }),
                    }}
                />
                <ResourcePicker
                    resourceType="Product"
                    showVariants={true}
                    open={this.state.open}
                    onSelection={(resources) => this.handleSelection(resources)}
                    onCancel={() => this.setState({ open: false })}
                />
                {emptyState ? (
                <Layout>
                    <EmptyState
                        heading="Discount your products temporarily"
                        action={{
                            content: 'Select products',
                            onAction: () => this.setState({ open: true }),
                        }}
                        image={img}
                    >
                        <p>Select products to change their price temporarily.</p>
                    </EmptyState>
                </Layout>
                    ) : (
                    <Form onSubmit={this.handleSubmit}>
                        <FormLayout>
                            <TextField
                                value={this.state.api_key}
                                onChange={this.handleApiKeyChange}
                                label="API key"
                                type="text"
                                helpText={
                                    <span>
                                      We’ll use this email address to inform you on future changes to
                                      Polaris.
                                    </span>
                                }
                            />
                            <TextField
                                value={this.state.api_secret}
                                onChange={this.handleApiSecretChange}
                                label="API Secret"
                                type="password"
                                helpText={
                                    <span>
                                      We’ll use this email address to inform you on future changes to
                                      Polaris.
                                    </span>
                                }
                            />
                            <Button submit>Submit</Button>
                        </FormLayout>
                    </Form>
                    )}
            </Page>
        );
    }
    handleSelection = (resources) => {
        const idsFromResources = resources.selection.map((product) => product.id);
        this.setState({ open: false });
        store.set('ids', idsFromResources);
    };

    handleApiKeyChange = (value) => {
        console.log(value, '>>>>>>>>>');
        this.setState({api_key: value});
        console.log(this.state.api_key, '>>>>>>>>>');
    }

    handleApiSecretChange = (value) => {
        console.log(value, '>>>>>>>>>');
        this.setState({api_secret: value});
        console.log(this.state.api_secret, '>>>>>>>>>');
    }

    handleSubmit = (value) => {
        console.log(value, '>>>>>>>>>>>>.');
    }
}

export default Index;
