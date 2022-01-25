import React, { Component } from 'react';
import moment from 'moment';
import axios from 'axios';
/**
 * Form that create payments
 * @param event the event ID
 * @param customer the customer's ID
 */
export default class PaymentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: props.event_id,
      customer: props.customer_id,
      amount: 0,
      last_remaining: props.remaining,
      date: moment().format('YYYY-MM-DD')
    };
  }
  onChange(e) {
    let input = e.target;
    this.setState({
      [input.name]: input.value
    });
  }
  componentDidMount() {
    M.updateTextFields();
  }
  addPayment(e) {
    axios.post('http://localhost:3000/payments', this.state).then(response => {
      if (response.status === 200) {
        this.props.loadPayments();
        this.setState({
          amount: 0,
          date: moment().format('YYYY-MM-DD')
        });
      } else {
        
        M.toast({
          html: response.data.err,
          classes: 'red'
        });
      }
    });
  }
  render() {
    return (
      <div className="row">
        <div className="input-field col s5">
          <input
            id="first_name"
            type="number"
            value={this.state.amount}
            onChange={this.onChange.bind(this)}
            name="amount"
            className="validate"
          />
          <label htmlFor="first_name">Montant</label>
        </div>
        <div className="input-field col s5">
          <input
            id="first_name"
            type="date"
            value={this.state.date}
            onChange={this.onChange.bind(this)}
            name="date"
            className="validate"
          />
          <label htmlFor="first_name">Date</label>
        </div>
        <div className="input-field col s2">
          <button className="btn" onClick={this.addPayment.bind(this)}>
            <i className="material-icons">save</i>
          </button>
        </div>
      </div>
    );
  }
}
