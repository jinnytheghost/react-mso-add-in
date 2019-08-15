import * as React from 'react';
import './Footer.less';
import { History, settingsLocation } from '../App';


export interface FooterProps {
    onClick(e): void;
    history: History;
    isAuthenticated: any;
}

const Footer: React.FunctionComponent<FooterProps> = (props) => {
    if (props.isAuthenticated) {
        return (
            <div className='footer'>
                <div className='delimiter' />
                <div className='footer__content'>
                    <button className='footer__button' onClick={(e) => { props.onClick(e); }}>Tell my team</button>
                    <button className='footer__button' onClick={() => props.history.push(settingsLocation)}>Settings</button>
                    <div className='footer__privacy_policy_container'>
                        <p className='footer__privacy_policy' onClick={() => { window.open('https://www.app.com/en/imprint/'); }}>Imprint | </p><p className='footer__privacy_policy' onClick={() => { window.open('https://www.app.com/en/privacypolicy/'); }}> Privacy policy | </p><p className='footer__privacy_policy' onClick={() => { window.open('https://www.app.com/en/termsofuse/'); }}> Terms of Use</p>
                    </div>
                    <p className='footer__copyright'>&copy;Copyright {currentYear} app UG. All rights reserved.</p>
                </div>
            </div >
        );
    } else {
        return (
            <div className='footer'>
                <div className='delimiter' />
                <div className='footer__content'>
                    <div className='footer__privacy_policy_container'>
                        <p className='footer__privacy_policy' onClick={() => { window.open('https://www.app.com/en/imprint/'); }}>Imprint | </p><p className='footer__privacy_policy' onClick={() => { window.open('https://www.app.com/en/privacypolicy/'); }}> Privacy policy | </p><p className='footer__privacy_policy' onClick={() => { window.open('https://www.app.com/en/termsofuse/'); }}> Terms of Use</p>
                    </div>
                    <p className='footer__copyright'>&copy;Copyright {currentYear} app UG. All rights reserved.</p>
                </div>
            </div >
        );
    }
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

export default Footer;
