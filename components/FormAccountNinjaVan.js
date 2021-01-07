import React, { useCallback, useState } from 'react';
import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import {FormLayout, Form, TextField, Button} from '@shopify/polaris';


class FormAccountNinjaVan extends React.Component {
    state = {
        email: ''
    };

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormLayout>
                    <TextField
                        value={this.state.email}
                        onChange={(value => {this.handleEmailChange(value)})}
                        label="Email"
                        type="email"
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
        );
    }

    handleEmailChange(event) {
        console.log(event.target, '>>>>>>>>>');
        // this.setState({email: event.target.email});
        console.log(this.state.email, '>>>>>>>>>');
    }

    handleSubmit(event) {
        console.log(event, '>>>>>>>>>>>>.');
    }
}

export default FormAccountNinjaVan