import CValidator from "../Validator/CustomValidation.js"
import reply from "../Common/reply.js";
import { Address } from "../Models/Address.js";


const user_address = async (req, res) => {
    let data = req.body
    let user = req.user
    try {
        let { status, message } = await CValidator(data, {
            name: 'required|min:3|max:15',
            address: 'required',
            flat_no: 'required|min:1|max:10',
            pincode: 'required|max:7',
            city: 'required|min:3|max:15',
            state: 'required|min:3|max:15'
        });

        if (!status) {
            return res.send(reply.failed(message));
        }
        const create_address = await Address.create({ address: data.address, user_id: user.id, name: data.name, flat_no: data.flat_no, pincode: data.pincode, city: data.city, state: data.state })
        return res.json(reply.success('Address Added', create_address));
    } catch (error) {
        return res.send(reply.failed('Failed to add address at this moment!!'))
    }
}

const get_address = async (req, res) => {
    try {
        let user = req.user
        const get_address = await Address.findAll({
            where: {
                user_id: user.id
            },
            attributes: ["address", "name", "flat_no", "pincode", "city", "state", "id"]
        })
        return res.json(reply.success('Address Fetched Successfully', get_address));
    } catch (error) {
        return res.send(reply.failed('Failed to Fetched address at this moment!!'))
    }
}

const delete_address = async (req, res) => {
    let request = req.body;
    request.id = req.params?.id || "";
    try {
        let user = req.user
        let { status, message } = await CValidator(request, {
            id: "required|exists:addresses,id",
        });
        if (!status) {
            return res.send(reply.failed(message));
        }
        const get_address = await Address.destroy({ where: { id: request.id, user_id: user.id } })
        return res.json(reply.success('Address Deleted Successfully', get_address));
    } catch (error) {
        console.log(error, "errorerror");
        return res.send(reply.failed('Failed to delete address at this moment!!'))
    }
}

const update_address = async (req, res) => {
    let data = req.body;
    data.id = req.params?.id || "";
    try {
        let { status, message } = await CValidator(data, {
            id: "required|exists:addresses,id",
            name: 'required|min:3|max:15',
            address: 'required',
            flat_no: 'required|min:1|max:10',
            pincode: 'required|max:7',
            city: 'required|min:3|max:15',
            state: 'required|min:3|max:15'
        });
        if (!status) {
            return res.send(reply.failed(message));
        }
       await Address.update(
            {
                address: data.address,
                name: data.name,
                flat_no: data.flat_no,
                pincode: data.pincode,
                city: data.city,
                state: data.state
            }, {
            where: {
                id: data.id
            }
        })
        return res.json(reply.success('Address Updated Successfully'));
    } catch (error) {
        console.log(error, "errorerror");
        return res.send(reply.failed('Failed to update address at this moment!!'))
    }
}


export default {
    user_address,
    get_address,
    delete_address,
    update_address
}