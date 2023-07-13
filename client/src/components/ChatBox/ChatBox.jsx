import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './ChatBox.scss';
import { BsFillSendFill, BsFillEmojiSmileFill } from 'react-icons/bs'
import { RxCross2 } from 'react-icons/rx'
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedContact } from '../../store/contactSlice';
import EmogiPicker from './EmogiPicker'
import ChatContainer from './ChatContainer';
import { addMessageApi } from '../../apis/restapis';
import { io } from 'socket.io-client';
import { setMessageArr } from '../../store/messageSlice';
import { setOnlineContacts } from '../../store/contactSlice';

const ChatBox = (props) => {
    const socket = useRef(null);
    const { avatarPath, userName } = props.contact;
    const [openEmogiKeyboard, setOpenEmogiKeyboard] = useState(false);
    const [message, setMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);

    const dispatch = useDispatch();

    const CurrentUser = JSON.parse(localStorage.getItem('user-data'));
    const SelectedUser = useSelector((state) => state.contact.selectedContact);
    const messageArr = useSelector((state) => state.messages.messageArr);

    useEffect(() => {
        if (CurrentUser) {
            socket.current = io('http://localhost:5000');
            socket.current.emit('add-user', CurrentUser._id);
            console.log(socket);
        }
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (message.length !== 0) {
            try {

                const response = await axios.post(addMessageApi, {
                    from: CurrentUser._id,
                    to: SelectedUser._id,
                    message: message
                });

                if (response.status === 200) {
                    setMessage("");
                }

                socket.current.emit('msg-send', {
                    to: SelectedUser._id,
                    from: CurrentUser._id,
                    message: message
                })

                const msg = [...messageArr];
                msg.push({ fromSelf: true, message: { message: { text: message } } });
                dispatch(setMessageArr(msg));
            }
            catch (err) {
                console.log(err);
            }
        }
    }


    useEffect(() => {
        if (socket.current) {
            socket.current.on('msg-receive', (msg) => {
                setArrivalMessage({ fromSelf: false, message: { message: { text: msg } } });
            })
        }
    }, []);

    useEffect(() => {
        const msg = [...messageArr];
        msg.push(arrivalMessage);
        dispatch(setMessageArr(msg));
    }, [arrivalMessage]);

    const handleClose = () => {
        dispatch(setSelectedContact(undefined));
    }

    const handleToggleEmogiKeyboard = () => {
        setOpenEmogiKeyboard((prevVal) => {
            return !prevVal;
        })
    }

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    }

    const handleEmojiClick = (emoji) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
    }

    return (
        <div className='chat-box'>
            <div className="top">
                <div className="details">
                    <img src={avatarPath} alt="" />
                    <p>{userName}</p>
                </div>
                <div className="btns" onClick={handleClose}>
                    <RxCross2 />
                </div>
            </div>
            <div className="mid">
                <ChatContainer message={message} ref={socket} />
            </div>
            <div className="bottom">
                {openEmogiKeyboard && <EmogiPicker onSelect={handleEmojiClick} />}

                <div className="emogi" onClick={handleToggleEmogiKeyboard}>
                    <BsFillEmojiSmileFill />
                </div>

                <form onSubmit={handleSend} className="message-form">
                    <input type="text" className="message-input" placeholder='Enter Message' onChange={handleMessageChange} value={message} />
                    <button type='submit'><BsFillSendFill /></button>
                </form>

            </div>
        </div>
    )
}

export default ChatBox