<?php
/**
 * Discord configured app function.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Discord configured app function.
 *
 * @package MO_DISCORD_INTEGRATOR
 */
require_once ABSPATH . 'wp-includes/pluggable.php';

echo '
<style>
/* The Modal (background) */
.modal_support_form {
	display: none; /* Hidden by default */
	position: fixed; /* Stay in place */
	z-index: 1; /* Sit on top */
	padding-top: 3%; /* Location of the box */
	left: 0;
	top: 0;
	width: 100%; /* Full width */
	height: 100%; /* Full height */
	overflow: auto; /* Enable scroll if needed */
	background-color: rgb(0,0,0); /* Fallback color */
	background-color: rgba(0,0,0,0.8); /* Black w/ opacity */
}
/* Modal Content */
.modal-content_support_form {
	background-color: #fefefe;
	padding: 35px;
	border: 3px solid black;
	width: 30%;
	height: auto;
	float: right;
	margin-right: 1%;
}

/* The Close Button */
.mo_support_close {
	color: #aaaaaa;
	float: right;
	font-size: 28px;
	font-weight: bold;
	
}

.mo_support_close:hover,
.mo_support_close:focus {
	color: #000;
	text-decoration: none;
	cursor: pointer;
}

</style>
    <div id="myModal" class="modal_support_form">
        <div id="mo_support_form" class="modal-content_support_form" >
            <span style="margin-top: -14px;padding-left: 2%;" class="mo_support_close">&times;</span>
            <h1>SUPPORT</h1>
            <p style="padding-left: 4px;">Need any help? <br>
            Just send us a query so that we can help you.</p>
            <form id="myForm" method="post" action="">
                <input type="hidden" name="option" value="mo_discord_contact_us_query_option" />
                <input type="hidden" name="mo_discord_contact_us_nonce" value="' . esc_attr( wp_create_nonce( 'mo-discord-contact-us-nonce' ) ) . '"/>
                <table class="mo_discord_settings_table ">
                    <tr style="width: 50%;float: left;">
                        <td >
                            <input style="padding:2%;border:none;box-shadow:none;border-bottom-style: solid;border-bottom-color: cornflowerblue;" type="email"  required placeholder="Enter your Email" name="mo_discord_contact_us_email" value="' . esc_attr( get_option( 'mo_discord_admin_email' ) ) . '"></td>
                    </tr>
                    <tr style="width: 50%;float: left;">
                        <td><input style="height: 39px;border:none;box-shadow:none;border-bottom-style: solid;border-bottom-color: cornflowerblue;" type="tel" id="contact_us_phone" placeholder="Enter your phone number with country code (+1)" class="mo_discord_table_contact" name="mo_discord_contact_us_phone" pattern="[\+]\d{11,14}|[\+]\d{1,4}[\s]\d{9,10}" value="' . esc_attr( get_option( 'mo_discord_admin_phone' ) ) . '"></td>
                    </tr>
                    
                    <tr>
                        <td><textarea style="width:100%;padding:2%;border:none;box-shadow:none;border-bottom-style: solid;border-bottom-color: cornflowerblue;" class="mo_discord_table_contact " onkeypress="mo_discord_valid_query(this)" onkeyup="mo_discord_valid_query(this)" placeholder="Write your query here" onblur="mo_discord_valid_query(this)" required name="mo_discord_contact_us_query" rows="4" style="resize: vertical;" id="mo_discord_support_msg"></textarea></td>
                    </tr>
                     <tr>
                        <td><textarea hidden name="mo_discord_feature_plan" id = "feature_plan"></textarea></td>
                    </tr>
                </table>
                <br>
                If you are looking for custom features in the plugin, just drop us an email at <a style="padding-left: 4px;" href="mailto:info@xecurify.com">info@xecurify.com</a>.
                <br><br><br>
                <center><input type="submit" name="submit" value="Submit Query" style="width:110px;" class="button button-primary button-large" /></center>
                </form>
        </div>
    </div>
    
';


