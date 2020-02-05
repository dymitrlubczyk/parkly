import React from 'react'


import Header from '../Header'
import AddressModal from './AddressModal'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import  Card  from '@material-ui/core/Card'
import InputAdornment from '@material-ui/core/InputAdornment'
import AddIcon from '@material-ui/icons/Add'

import DateFnsUtils from '@date-io/date-fns';
import { TimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers'

import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { parkingAdded } from '../../redux/actions'


const styles = {
    
    card:{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height: '550px',
        width: '450px',
        backgroundColor: '#ffffff'

    },

    grid:{
        flexBasis: '20%',
        height:'100%'
    },

    
    field:{
        backgroundColor:'#ffffff',
        width:'80%',
        margin:'10px',
        '& p':{
            color:'#000000',
          },
       
    },

    button:{
        backgroundColor:'#ffffff',
        color:'#888888',
        height: '50px',
        width:'60%',
        margin:'40px'
    },
    
    header:{
        color:'primary',
        margin:'5%'
    },

    timer:{
        width:'30%',
        margin:'10px',
    },

    specialCursor:{
        cursor:'pointer'
    }


}

const numberRegEx = new RegExp('^[1-9][0-9]*$')

class AddParking extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state={
            city:'',
            street:'',
            number:'',
            spotsNumber:0,
            price:0,
            opens:new Date('2000-01-01T00:00:00+00:00'),
            closes:new Date('2000-01-01T00:00:00+00:00'),
            addressModal:false,
            priceError:'',
            spotsNumberError:''
        }
    }
    setAddress=address=>{
        this.setState({
            city:address.city,
            street:address.street,
            number:address.number,
            addressModal:false
        })
    }

    clickCancel=()=>{
        this.setState({addressModal:false})
    }

    checkPrice=(price)=>{
        
        if(!price.toString().match(numberRegEx))
        {
            this.setState({priceError:'Invalid input'})
        }
        else
        {
            this.setState({priceError:''})

        }
    }

    checkSpots=(spots)=>{
        if(!spots.toString().match(numberRegEx))
        {
            this.setState({spotsNumberError:'INvalid input'})
        }
        else
        {
            this.setState({spotsNumberError:''})

        }
    }
    clickAdd=()=>{
        const {
            city,
            street,
            number,
            spotsNumber,
            price,
            opens,
            closes
        } = this.state

        const parking={
            city,
            street,
            number,
            spotsNumber,
            price,
            opens:opens.getHours(),
            closes:closes.getHours(),
            ownerId:this.props.user.id
        }
        fetch('http://parkly-tuesday.us-east-1.elasticbeanstalk.com/parkings', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-name':'parkly',
                'User-token':this.props.user.userToken

            },
            body: JSON.stringify(parking)
        })
        .then(res=>res.json())
        .then(p=>this.props.parkingAdded(p))
        .then(e=>this.props.history.push("/parkings"))


    }
    render(){
        const {
            city,
            street,
            number,
            spotsNumber,
            price,
            opens,
            closes,
            addressModal,
            priceError,
            spotsNumberError
        } = this.state
        
        const {
            card,
            grid,
            field,
            button,
            header,
            timer,
            specialCursor
        }=this.props.classes
        
        const canAdd=city.length>0 && !priceError && !spotsNumberError
        return(
            <>
            {addressModal?
            <AddressModal 
                setAddress={this.setAddress} 
                clickCancel={this.clickCancel}
                city={city} 
                street={street} 
                number={number}/>:
            <>
            <Header/>
            <Card
                className={card}>
                <Grid
                    className={grid}
                    container
                    direction="column"
                    justify="center"
                    alignItems="center">
                    <Typography 
                        className={header}
                        vartiant='h4'>
                        ADD NEW PARKING
                    </Typography>
                    <TextField
                            label={'Address'}
                            value={city?street+' '+number+', '+city:''}
                            className={field}
                            fullWidth
                            variant={'outlined'}
                            onClick={e=>this.setState({addressModal:true})}
                            InputProps={{
                                endAdornment: 
                                <InputAdornment 
                                    position='end'
                                    className={specialCursor}>
                                    <AddIcon
                                        onClick={e=>this.setState({addressModal:true})}/>
                                </InputAdornment>,                                    
                                    readOnly: true,
                                    classes: {
                                        input:specialCursor
                                    }
                                }}
                        />
                    <TextField
                        label={'Number of spots'}
                        type={'number'}
                        onChange={e =>{ this.setState({spotsNumber:e.target.value});this.checkSpots(e.target.value)}}
                        value={spotsNumber}
                        className={field}
                        fullWidth
                        error={spotsNumberError.length>0}
                        helperText={spotsNumberError}
                        variant={'outlined'}
                        InputProps={{ inputProps: { min: 0} }}
                        />
                    <TextField
                        label={'Price per hour'}
                        type={'number'}
                        onChange={e => {this.setState({price:e.target.value});this.checkPrice(e.target.value)}}
                        value={price}
                        className={field}
                        fullWidth
                        error={priceError.length>0}
                        helperText={priceError}
                        variant={'outlined'}
                        InputProps={{
                            endAdornment: <InputAdornment position='end'>PLN</InputAdornment>,
                            inputProps: { min: 0}
                            }}
                        />

                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Grid
                            container
                            direction='row'
                            justify='space-around'
                            alignItems='center'>
                         
                            <TimePicker
                                margin="normal"
                                label="Opens"
                                value={opens}
                                ampm={false}
                                views={["hours"]}
                                onChange={date => this.setState({opens:date})}
                                className={timer}
                                />
                            
                            <TimePicker
                                margin="normal"
                                label="Closes"
                                value={closes}
                                ampm={false}
                                views={["hours"]}
                                onChange={date=>this.setState({closes:date})}
                                className={timer}
                                />
                                
                        </Grid>
                    </MuiPickersUtilsProvider>
                    
                    <Button
                        onClick={this.clickAdd}
                        className={button}
                        variant={'contained'}
                        color={'primary'}
                        disabled={!canAdd}
                        >
                        add
                    </Button>
                </Grid>
            </Card>
            </>}
            </>
        )
    }
}
const mapDispatchToProps = (dispatch) => ({
    parkingAdded: parking => dispatch(parkingAdded(parking))
})

const mapStateToProps = (state /*, ownProps*/) => {
    return {
      user:state.user,
    }
}
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(AddParking)))
