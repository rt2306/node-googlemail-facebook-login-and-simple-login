import Validator from 'validatorjs';
import { Model, Sequelize } from '../Database/sequelize.js';
import _ from "lodash";
import myCache from "../NodeCache/cache.js";

function isEmptyEl(array, i = 0) {
    return !(array[i]);
}

const hasDuplicates = (arr) => arr.some((e, i, arr) => arr.indexOf(e) !== i);

Validator.registerAsync('distinct', function (columnValue, attribute, req, passes) {

    let grp = _.map(columnValue, 'currency');

    if(hasDuplicates(grp)){
        return passes(false, "Currency should be unique");
    }

    return passes(); 
});


Validator.registerAsync('unique', function (columnValue, attribute, req, passes) {
    const attr = attribute.split(",");  // 0 = tablename , 1 = columnname
    Model.query(`SELECT * FROM ${attr[0]} Where ${attr[1]} = "${columnValue}" LIMIT 1`).then(([results]) => {
        return (results.length == 0) ? passes() : passes(false, `The ${req} has already been taken.`);
    }).catch((error) => {
        return passes(false, error.message)
    });
});

Validator.registerAsync('exists', function (columnValue, attribute, req, passes) {

    const attr = attribute.split(",");  // 0 = tablename , 1 = columnname

    Model.query(`SELECT * FROM ${attr[0]} Where ${attr[1]} = "${columnValue}" LIMIT 1`).then(([results]) => {
        return (results.length == 0) ? passes(false, `The ${req} is not Exists.`) : passes();
    }).catch((error) => {
        return passes(false, error.message)
    });
});

Validator.registerAsync('exists-except', function (columnValue, attribute, req, passes) {
    const attr = attribute.split(",");  // 0 = tablename , 1 = columnname, 2 = expect column, 3 = expect column value
    Model.query(`SELECT * FROM ${attr[0]} Where ${attr[1]} = "${columnValue}" AND ${attr[2]} != ${attr[3]} LIMIT 1`).then(([results]) => {
        return (results.length > 0) ? passes(false, `The ${req} is Already Exists.`) : passes();
    }).catch((error) => {
        return passes(false, error.message)
    });
});

Validator.registerAsync('gte', function (columnValue, attribute, req, passes) {
 
    if(parseFloat(attribute) > parseFloat(columnValue)){
        return passes(false, `The ${req} should be greater than or equal to ${attribute}`);
    }else{
       return passes();
    } 
});

Validator.registerAsync('gt', function (columnValue, attribute, req, passes) {
     
    if(parseFloat(attribute) >= parseFloat(columnValue)){
        return passes(false, `The ${req} should be greater than ${attribute}`);
    }else{
       return passes();
    } 
});

Validator.registerAsync('lt', function (columnValue, attribute, req, passes) {
 
    if(parseFloat(columnValue) > parseFloat(attribute)){
        return passes(false, `The ${req} should be less than ${attribute}`);
    }else{
       return passes();
    } 
});

Validator.registerAsync('inFiatArray', function (columnValue, attribute, req, passes) {	
    // is array or not 	
    if(!Array.isArray(columnValue)){	
        return passes(false, `The ${req} should be array.`);	
    }	
    if (isEmptyEl(columnValue)) {	
        return {s: false, m: `The ${req} must not be empty.`};	
    }	
     
    // payment methods	
    let p_m =  myCache.get('p2p_payment_methods') ?? [];	
    if(!p_m){	
        return passes(false, `Unable to place Order at this time.`);	
    }	
    
    if(Object.keys(p_m).length == 0){
        return passes(false, `The ${req} is not available.`);	
    }

    attribute = p_m[attribute];	
    
    if(!attribute){
        return passes(false, `The ${req} is not supported.`);	
    }

    _.find(columnValue,(v) => {	
         
        if(!attribute.includes(v)){	
            return passes(false, `The ${req} is not supported.`);	
        }	
    })	
    return passes();	
});


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
Validator.register('password_regex', value => passwordRegex.test(value), "Password must contain at least one uppercase letter, one lowercase letter and one number");

const upiRegex = /^[\w.-]+@[\w.-]+$/;
Validator.register('upi_regex', value => upiRegex.test(value), "UPI ID Format is Invalid");

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
Validator.register('ifsc_regex', value => ifscRegex.test(value), "IFSC Code Format is Invalid");


const firstError = (validation) => {
    const firstkey = Object.keys(validation.errors.errors)[0];
    return validation.errors.first(firstkey);
}


function validate(request, rules, messages = {}) {

    if (typeof request != 'object' || typeof rules != 'object' || typeof messages != 'object') {
        return {
            status: 0,
            message: 'Invalid Params'
        }
    }

    let validation = new Validator(request, rules, messages);

    return new Promise((resolve, reject) => {
        validation.checkAsync(() => resolve({ status: 1, message: "" }), () => reject({ status: 0, message: firstError(validation) }))
    }).then(r => r).catch(err => err);

}

export default validate;