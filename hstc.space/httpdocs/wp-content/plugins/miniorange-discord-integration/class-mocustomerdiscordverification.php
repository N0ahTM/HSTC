<?php
/** MiniOrange enables user to log in through OpenID to apps such as Discord etc.
Copyright (C) 2015  miniOrange

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 * @package         miniOrange OAuth
 * @license     http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 */

/**
This library is miniOrange Authentication Service.
Contains Request Calls to Customer service.
 **/
class MoCustomerDiscordverification {
	/**
	 * Email
	 *
	 * @var [string]
	 */
	public $email;
	/**
	 * Phone
	 *
	 * @var [int]
	 */
	public $phone;
	/**
	 * Default key.
	 *
	 * @var string
	 */
	private $default_customer_key = '16555';
	/**
	 * Default api key
	 *
	 * @var string
	 */
	private $default_api_key = 'fFd2XcvTGDemZvbw1bcUesNJWEqKbbUq';
	/**
	 * Nonce action.
	 *
	 * @var string
	 */
	private $nonce_action;
	/**
	 * Create Dis cutsomer.
	 *
	 * @param [string] $action action.
	 * @param [string] $password password.
	 * @return string
	 */
	public function create_dis_customer( $action, $password ) {
		$url                = get_option( 'mo_discord_integrator_host_name' ) . '/moas/rest/customer/add';
		$current_user       = wp_get_current_user();
		$this->email        = get_option( 'mo_discord_admin_email' );
		$this->nonce_action = $action;
		$fields             = array(
			'areaOfInterest' => 'WordPress Discord Integration Plugin',
			'email'          => $this->email,
			'password'       => $password,
		);
		$field_string       = wp_json_encode( $fields );
		$headers            = array(
			'Content-Type'  => 'application/json',
			'charset'       => 'UTF-8',
			'Authorization' => 'Basic',
		);
		$args               = array(
			'method'      => 'POST',
			'body'        => $field_string,
			'timeout'     => '15',
			'redirection' => '5',
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
		);
		$response           = self::mo_discord_wp_remote_post( $url, $args );
		if ( null === $response['body'] ) {
			if ( 'mo_register_new_user' === $action ) {
				wp_send_json( array( 'error' => 'There was an error creating an account for you. Please try again.' ) );
			} else {
				update_option( 'mo_discord_message', 'There was an error creating an account for you. Please try again.' );
				update_option( 'mo_discord_registration_status', 'error creating an account' );
				mo_discord_show_error_message();
				if ( get_option( 'regi_pop_up' ) === 'yes' ) {
					update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
					mo_discord_registeration_modal();
				}
			}
		} else {
			return $response['body'];
		}
	}
	/**
	 * Get customer key.
	 *
	 * @param [string] $password password.
	 * @return string
	 */
	public function get_dis_customer_key( $password ) {
		$url   = get_option( 'mo_discord_integrator_host_name' ) . '/moas/rest/customer/key';
		$email = get_option( 'mo_discord_admin_email' );

		$fields       = array(
			'email'    => sanitize_email( $email ),
			'password' => $password,
		);
		$field_string = wp_json_encode( $fields );
		$headers      = array(
			'Content-Type'  => 'application/json',
			'charset'       => 'UTF-8',
			'Authorization' => 'Basic',
		);
		$args         = array(
			'method'      => 'POST',
			'body'        => $field_string,
			'timeout'     => '15',
			'redirection' => '5',
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
		);
		$response     = self::mo_discord_wp_remote_post( $url, $args );
		return $response['body'];
	}
	/**
	 * Check dis customer.
	 *
	 * @return string
	 */
	public function check_dis_customer() {
		$url   = get_option( 'mo_discord_integrator_host_name' ) . '/moas/rest/customer/check-if-exists';
		$email = get_option( 'mo_discord_admin_email' );

		$fields       = array(
			'email' => sanitize_email( $email ),
		);
		$field_string = wp_json_encode( $fields );

		$headers  = array(
			'Content-Type'  => 'application/json',
			'charset'       => 'UTF-8',
			'Authorization' => 'Basic',
		);
		$args     = array(
			'method'      => 'POST',
			'body'        => $field_string,
			'timeout'     => '15',
			'redirection' => '5',
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
		);
		$response = self::mo_discord_wp_remote_post( $url, $args );
		return $response['body'];
	}
	/**
	 * Get Dis time stamp.
	 *
	 * @return object
	 */
	public function get_dis_timestamp() {
		$url      = get_option( 'mo_discord_integrator_host_name' ) . '/moas/rest/mobile/get-timestamp';
		$response = self::mo_discord_wp_remote_post( $url );
		return $response['body'];
	}
	/**
	 * Send email alert.
	 *
	 * @param [string] $email email.
	 * @param [string] $phone phone.
	 * @param [string] $message message.
	 * @return string
	 */
	public function mo_discord_send_email_alert( $email, $phone, $message ) {

		$hostname     = get_site_option( 'mo_discord_integrator_host_name' );
		$url          = $hostname . '/moas/api/notify/send';
		$customer_key = $this->default_customer_key;
		$api_key      = $this->default_api_key;

		$phone_number           = get_option( 'mo_discord_admin_phone' );
		$current_time_in_millis = self::get_dis_timestamp();
		$string_to_hash         = $customer_key . $current_time_in_millis . $api_key;
		$hash_value             = hash( 'sha512', $string_to_hash );
		$from_email             = $email;
		$subject                = 'miniOrange WordPress Discord Integration -' . get_option( 'mo_discord_integrator_version' ) . ' : ' . $email;
		$site_url               = site_url();
		$activation_date        = get_option( 'mo_discord_user_activation_date1' );
		$deactivationdate       = gmdate( 'Y-m-d' );
		$version                = get_option( 'mo_discord_integrator_version' );
		$store_activation       = strtotime( $activation_date );
		$store_deactivation     = strtotime( $deactivationdate );
		$diff                   = $store_deactivation - $store_activation;
		$total_activation_days  = abs( round( $diff / 86400 ) );
		global $user;
		$user = wp_get_current_user();

		$query   = ' miniOrange WordPress Discord Integration';
		$content = '<div >Hello, <br><br>First Name :<br><br>Last  Name :
								<br><br>Company : ' . sanitize_text_field( isset( $_SERVER['HTTP_HOST'] ) ? wp_unslash( $_SERVER['HTTP_HOST'] ) : '' ) . '
								<br><br>Phone Number : ' . $phone_number . '
								<br><br>Email : <a href="mailto:' . $from_email . '" target="_blank">' . $from_email . '</a>
								<br><br>Activation time : ' . $activation_date . ' - ' . $deactivationdate . '  [' . $total_activation_days . ']
								<br><br>Plugin Deactivated: ' . $query . '' . $version . '
								<br><br>Reason: <b>' . $message . '</b></div>';

		$fields       = array(
			'customerKey' => $customer_key,
			'sendEmail'   => true,
			'email'       => array(
				'customerKey' => $customer_key,
				'fromEmail'   => $from_email,
				'bccEmail'    => 'discordsupport@xecurify.com',
				'fromName'    => 'miniOrange',
				'toEmail'     => 'discordsupport@xecurify.com',
				'toName'      => 'discordsupport@xecurify.com',
				'subject'     => $subject,
				'content'     => $content,
			),
		);
		$field_string = wp_json_encode( $fields );

		$headers          = array(
			'Content-Type'  => 'application/json',
			'Customer-Key'  => $customer_key,
			'Timestamp'     => $current_time_in_millis,
			'Authorization' => $hash_value,
		);
		$args             = array(
			'method'      => 'POST',
			'body'        => $field_string,
			'timeout'     => '15',
			'redirection' => '5',
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
		);
		$response         = self::mo_discord_wp_remote_post( $url, $args );
		$response['body'] = isset( $response['body'] ) ? $response['body'] : '';
		return $response['body'];

	}
	/**
	 * Contact us form
	 *
	 * @param [string] $email email.
	 * @param [int]    $phone phone.
	 * @param [string] $query query.
	 * @param [string] $feature_plan feature plan.
	 * @return object
	 */
	public function mo_dis_submit_contact_us( $email, $phone, $query, $feature_plan ) {
		$url          = get_option( 'mo_discord_integrator_host_name' ) . '/moas/rest/customer/contact-us';
		$current_user = wp_get_current_user();
		$company      = ( get_option( 'mo_discord_admin_company_name' ) ? get_option( 'mo_discord_admin_company_name' ) : isset( $_SERVER ['SERVER_NAME'] ) ) ? sanitize_text_field( wp_unslash( $_SERVER ['SERVER_NAME'] ) ) : '';
		$first_name   = get_option( 'mo_discord_admin_first_name' ) ? get_option( 'mo_discord_admin_first_name' ) : $current_user->user_firstname;
		$last_name    = get_option( 'mo_discord_admin_last_name' ) ? get_option( 'mo_discord_admin_last_name' ) : $current_user->user_lastname;
		$query        = '[WordPress Discord Integration Plugin Version: ' . get_option( 'mo_discord_integrator_version' ) . '] ' . $feature_plan . ':' . $query;
		$fields       = array(
			'firstName' => $first_name,
			'lastName'  => $last_name,
			'company'   => $company,
			'email'     => $email,
			'ccEmail'   => 'discordsupport@xecurify.com',
			'phone'     => $phone,
			'query'     => $query,
		);
		$field_string = wp_json_encode( $fields );
		$headers      = array(
			'Content-Type'  => 'application/json',
			'charset'       => 'UTF-8',
			'Authorization' => 'Basic',
		);
		$args         = array(
			'method'      => 'POST',
			'body'        => $field_string,
			'timeout'     => '10',
			'redirection' => '5',
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
		);
		$response     = self::mo_discord_wp_remote_post( $url, $args );
		return $response['body'];
	}
	/**
	 * Forgot password backend.
	 *
	 * @param [string] $email email.
	 * @return string
	 */
	public function mo_dis_forgot_password( $email ) {

		$url = get_option( 'mo_discord_integrator_host_name' ) . '/moas/rest/customer/password-reset';
		/* The customer Key provided to you */
		$customer_key = get_option( 'mo_discord_admin_customer_key' );

		/* The customer API Key provided to you */
		$api_key = get_option( 'mo_discord_admin_api_key' );

		/* Current time in milliseconds since midnight, January 1, 1970 UTC. */
		$current_time_in_millis = round( microtime( true ) * 1000 );
		$string_to_hash         = $customer_key . number_format( $current_time_in_millis, 0, '', '' ) . $api_key;
		$hash_value             = hash( 'sha512', $string_to_hash );

		$fields = '';

		$fields = array(
			'email' => $email,
		);

		$field_string = wp_json_encode( $fields );

		$headers  = array(
			'Content-Type'  => 'application/json',
			'Customer-Key'  => $customer_key,
			'Timestamp'     => $current_time_in_millis,
			'Authorization' => $hash_value,
		);
		$args     = array(
			'method'      => 'POST',
			'body'        => $field_string,
			'timeout'     => '15',
			'redirection' => '5',
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
		);
		$response = self::mo_discord_wp_remote_post( $url, $args );
		return $response['body'];
	}
	/**
	 * Wp remote post
	 *
	 * @param [string] $url url.
	 * @param array    $args arg.
	 * @return object.
	 */
	public function mo_discord_wp_remote_post( $url, $args = array() ) {
		$check_action = isset( $this->nonce_action ) ? esc_attr( sanitize_text_field( $this->nonce_action ) ) : '';
		$response     = wp_remote_post( $url, $args );
		if ( ! is_wp_error( $response ) ) {
			return $response;
		} else {
			if ( 'mo_register_new_user' === $check_action ) {
				wp_send_json( array( 'error' => 'Unable to connect to the Internet. Please try again.' ) );
			} else {
				update_option( 'mo_discord_message', 'Unable to connect to the Internet. Please try again.' );
				mo_discord_success_message();
			}
		}
	}

}
