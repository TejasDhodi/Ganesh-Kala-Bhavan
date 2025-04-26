import React, { useState } from 'react'

const SendMail = () => {

    type items = {
        title: string;
        quantity: number;
        price: number;
        total: number;
    }

    type inputs = {
        paymentMode: string,
        amount: number | "",
        email: string,
        name: string,
        phone: number | "",
        items: items[]
    }

    const [inputs, setInputs] = useState<inputs>({
        paymentMode: "",
        amount: "",
        email: "",
        name: "",
        phone: "",
        items: [{
            title: "",
            quantity: 1,
            price: 0,
            total: 0
        }]
    })

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        const newItems = [...inputs.items];

        if (name === 'title' || name === 'quantity' || name === 'price' || name === 'total') {
            newItems[index] = { ...newItems[index], [name]: name === 'quantity' || name === 'price' || name === 'total' ? Number(value || 0) : value };

            if (name === 'quantity' || name === 'price') {
                newItems[index].total = newItems[index].quantity * newItems[index].price;
            }

        } else {
            setInputs(prev => ({
                ...prev,
                [name]: name === 'amount' || name === 'phone' ? (value ? Number(value) : "") : value,
            }));
        }

        setInputs(prev => ({
            ...prev,
            items: newItems,
            amount: handleFinalAmount(newItems)
        }));
    };

    const handleAddItems = () => {
        setInputs({
            ...inputs,
            items: [
                ...inputs.items,
                { title: "", quantity: 1, price: 0, total: 0 }
            ]
        })
    }

    const handleSendMail = async (e: any) => {
        try {
            e.preventDefault();
            setLoading(true);
            const response = await fetch("http://localhost:3000/api/v1/receipt/generateReceipt", {
                method: 'POST',
                body: JSON.stringify(inputs),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                alert('Send Successfylly');
                setLoading(false);
                console.log({ inputs });

            }
        } catch (error: any) {
            console.log({ inputs });
            setLoading(false)
            alert(error.message)
            console.log(error);
        }
    }

    const handleFinalAmount = (items: items[]) => {
        return items.reduce((acc, item) => acc + (item.quantity * item.price), 0) || 0;
    };
    return (
        <form onSubmit={handleSendMail}>
            <div className="inputContainer">
                <div className="inputs">
                    <div className="input-box">
                        <label htmlFor="name">Customer Name</label>
                        <input type="text" name="name" id="name" placeholder='Tejas Dhodi' value={inputs.name} onChange={(e) => handleChange(e, -1)} />
                    </div>
                    <div className="input-box">
                        <label htmlFor="email">Customer Email</label>
                        <input type="email" name="email" id="email" placeholder='tejas@gmail.com' value={inputs.email} onChange={(e) => handleChange(e, -1)} />
                    </div>
                </div>
                <div className="inputs">

                    <div className="input-box">
                        <label htmlFor="phone">Customer Phone</label>
                        <input type="text" name="phone" id="phone" placeholder='755xxxxxx8' value={inputs.phone} onChange={(e) => handleChange(e, -1)} />
                    </div>

                    <div className="input-box">
                        <label htmlFor="paymentMode">Payment Mode</label>
                        <select name="paymentMode" id="paymentMode" value={inputs.paymentMode} onChange={(e) => handleChange(e, -1)}>
                            <option value="#">Select Payment Method</option>
                            {
                                ['Google Pay', 'Paytm', 'Phonepe'].map(currElem => (
                                    <option value={currElem}>{currElem}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                {
                    inputs.items.map(({ title, quantity, price, total }, index) => {
                        return (
                            <div className="inputs">
                                <div className="input-box">
                                    <label htmlFor="title">Title</label>
                                    <input type="text" name="title" id="title" value={title} placeholder='Dagadusheth' onChange={(e) => handleChange(e, index)} />
                                </div>

                                <div className="input-box">
                                    <label htmlFor="quantity">Quantity</label>
                                    <input type="text" name="quantity" id="quantity" value={quantity} onChange={(e) => handleChange(e, index)} />
                                </div>


                                <div className="input-box">
                                    <label htmlFor="price">Price</label>
                                    <input type="text" name="price" id="price" value={price} onChange={(e) => handleChange(e, index)} />
                                </div>

                                <div className="input-box">
                                    <label htmlFor="total">Total</label>
                                    <input type="text" name="total" id="total" value={total} onChange={(e) => handleChange(e, index)} />
                                </div>
                            </div>
                        )
                    })
                }
                <div className="inputs">
                    <div className="input-box">
                        <label htmlFor="grandTotal">Grand Total</label>
                        <input type="text" name="amount" id="grandTotal" placeholder='Amount' value={inputs.amount} onChange={(e) => handleChange(e, -1)} />
                    </div>
                </div>
            </div>
            <button type='button' onClick={handleAddItems}>Add Items</button>
            <button type='submit'>{loading ? '...' : 'Submit'}</button>
        </form>
    )
}

export default SendMail
