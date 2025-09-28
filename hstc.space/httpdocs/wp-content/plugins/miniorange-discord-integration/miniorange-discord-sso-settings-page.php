<?php
/**
 * Discord configured app function.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

ob_start();

require 'view/config_apps/mo-discord-config-apps.php';
require 'view/customise_social_icons/mo-discord-cust-icons.php';
require 'view/discord_integration/mo-dis-discord-res.php';
require 'view/discord_integration/mo-dis-discord-role-map.php';
require 'view/licensing_plans/mo-discord-lic-plans.php';
require 'view/shrtco/mo-discord-shrtco.php';
require 'class-mocustomerdiscordverification.php';
require 'view/woocommerce-integration/mo-woocommerce-integration.php';
require 'view/link_discord_account/mo-link-discord-account.php';
require 'view/redirect_options/mo-discord-redirect-options.php';

/**
 * Register discord
 *
 * @return void
 */
function mo_register_discord() {
	$mo_request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
	$mo_tab_name    = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : 'config_apps';//phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Ignoring nonce verification because we are fetching data from URL and not on form submission.
	if ( isset( $mo_tab_name ) && 'register' !== $mo_tab_name ) {
		$active_tab = $mo_tab_name;
	} else {
		$active_tab = 'config_apps';
	}
	if ( 'licensing_plans' === $active_tab ) {
		?>
		<div style="text-align:center;"><h1>WordPress Discord Integration Plugin</h1></div>
		<div><a style="margin-top: 0px;background: #d0d0d0;border-color: #1162b5;color: #151515; float: left" class="button" onclick="window.location='<?php echo esc_url( site_url() ); ?>'+'/wp-admin/admin.php?page=mo_discord_settings'"><span class="dashicons dashicons-arrow-left-alt" style="vertical-align: middle;"></span><b style="font-size: 15px;"> &nbsp;&nbsp;Back To Plugin Configuration</b></a></div>
		<div style="text-align:center; color: rgb(233, 125, 104); margin-top: 55px; font-size: 23px"> You are currently on the Free version of the plugin <br> <br><span style="font-size: 20px; ">
					<li style="color: dimgray; margin-top: 0px;list-style-type: none;">
						<div class="mo_discord-quote">
							<p>
								<span onclick="void(0);" class="mo_discord-check-tooltip" style="font-size: 15px">Why should I upgrade?
									<span class="mo_discord-info">
										<span class="mo_discord-pronounce">Why should I upgrade to premium plugin?</span>
										<span class="mo_discord-text">Upgrading lets you access all of our features such as User Restriction, Role Mapping, Autopost etc.</span>
									</span>
								</span>
							</p>
						</div>
						<br><br>
					</li>
		</div>

		<?php
	} else {
		?>
	<div>
		<table>
			<tr>
				<td><img id="logo" style="margin-top: 25px" src="<?php echo esc_attr( plugin_dir_url( __FILE__ ) ); ?>includes/images/logo.png"></td>
				<td>&nbsp;<a style="text-decoration:none" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration/" target="_blank"><h1 style="color: #110d0d85">miniOrange WordPress Discord Integration &nbsp;</h1></a></td>
				<td> <a id="pricing" style="margin-top: 23px;background: #FFA335;border-color: #FFA335;color: white;" class="button"<?php echo 'licensing_plans' === $active_tab ? 'nav-tab-active' : ''; ?>" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), $mo_request_uri ) ); ?>">Licensing Plans</a></td>
			</tr>
		</table>
	</div>
	<div style="width: 100%" id="mo-dis-main-content-div">
		<div id="mo_discord_menu_height" style="width: 15%; float: left; background-color: #32373C; border-radius: 15px 0px 0px 15px;">
			<div style="margin-top: 9px;border-bottom: 0px;text-align:center;">
				<br><br><br>
			</div>
			<div class="mo_discord_tab" style="width:100%; border-radius: 0px 0px 0px 15px;">
				<a id="config_apps" class="tablinks
				<?php
				if ( 'config_apps' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'config_apps' ), $mo_request_uri ) ); ?>"><i class="fa fa-cog" aria-hidden="true"></i> Discord Login</a>
				<a id="attribute_mapping" class="tablinks
				<?php
				if ( 'attribute_mapping' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'attribute_mapping' ), $mo_request_uri ) ); ?>"><i class="fa fa-address-card"></i> Attribute Mapping</a>
				<a id="redirect_options" class="tablinks
				<?php
				if ( 'redirect_options' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'redirect_options' ), $mo_request_uri ) ); ?>"><i class="fa fa-align-justify"></i> Redirect Options</a>
				<a id="customise_social_icons" class="tablinks
				<?php
				if ( 'customise_social_icons' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'customise_social_icons' ), $mo_request_uri ) ); ?>"> <i class="fa fa-align-justify" aria-hidden="true"></i> Design Icons</a>
				<a id="shortcodes" class="tablinks
				<?php
				if ( 'shortcodes' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'shortcodes' ), $mo_request_uri ) ); ?>"><i class="fa fa-code" aria-hidden="true"></i> Shortcodes</a>
				<a id="link_discord_account" class="tablinks
				<?php
				if ( 'link_discord_account' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'link_discord_account' ), $mo_request_uri ) ); ?>"><i class="fa fa-address-card"></i> Link Discord Account</a>
				<a id="discord_integration" class="tablinks
				<?php
				if ( 'discord_integration' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'discord_integration' ), $mo_request_uri ) ); ?>"><i class="fa fa-wrench" aria-hidden="true"></i> Discord Server Configuration</a>
				<a id="discord_2_wp_role_mapping" class="tablinks
				<?php
				if ( 'discord_2_wp_role_mapping' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'discord_2_wp_role_mapping' ), $mo_request_uri ) ); ?>"><i class="fa fa-map-signs" aria-hidden="true"></i>  Discord to WP Role Mapping</a>
				<a id="wp_2_discord_role_mapping" class="tablinks
				<?php
				if ( 'wp_2_discord_role_mapping' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'wp_2_discord_role_mapping' ), $mo_request_uri ) ); ?>"><i class="fa fa-map-signs" aria-hidden="true"></i>  WP To Discord Role Mapping</a>
				<a id="mem_2_discord_role_mapping" class="tablinks
				<?php
				if ( 'mem_2_discord_role_mapping' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'mem_2_discord_role_mapping' ), $mo_request_uri ) ); ?>"><i class="fa fa-map-signs" aria-hidden="true"></i>  Membership/Subscription based Role Mapping</a>
				<a id="woocommerce_integration" class="tablinks
				<?php
				if ( 'woocommerce_integration' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'woocommerce_integration' ), $mo_request_uri ) ); ?>"><i class="fa fa-cart-arrow-down" aria-hidden="true"></i> Woocommerce/WordPress Integration</a>
				<a id="profile" class="tablinks
				<?php
				if ( 'profile' === $active_tab ) {
					echo '_active';}
				?>
				" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'profile' ), $mo_request_uri ) ); ?>"><i class="fa fa-user" aria-hidden="true"></i> Account</a>

			</div>
		</div>
		<style>
			body {font-family: Arial, Helvetica, sans-serif;}
		</style>
		<div id="mo_discord_settings" style="width: 85%; float: right;">
			<div style="background-color: #FFFFFF;width: 90%;border-radius: 0px 15px 15px 0px;">
					<h3 id="mo_discord_page_heading" class="mo_discord_highlight" style="color: white;margin: 0;padding: 22.5px;border-radius: 0px 15px 0px 0px;font-size: x-large">&nbsp</h3>
					<div id="mo_discord_msgs"></div>
				<table style="width:100%;">
					<?php
	}
	?>
						<tr>
							<td style="vertical-align:top;">
								<?php
								switch ( $active_tab ) {
									case 'config_apps':
										mo_discord_show_apps();
										break;
									case 'customise_social_icons':
										mo_discord_customise_social_icons();
										break;
									case 'redirect_options':
										mo_discord_redirect_options();
										break;
									case 'attribute_mapping':
										mo_discord_attribute_mapping();
										break;
									case 'wp_2_discord_role_mapping':
										mo_discord_role_mapping();
										break;
									case 'mem_2_discord_role_mapping':
										mo_mem_2_discord_role_mapping();
										break;
									case 'discord_2_wp_role_mapping':
										mo_discord_2_wp_role_mapping();
										break;
									case 'discord_integration':
										mo_discord_integration();
										break;
									case 'shortcodes':
										mo_discord_login_shortcodes();
										break;
									case 'profile':
										mo_discord_profile();
										break;
									case 'licensing_plans':
										mo_discord_licensing_plans();
										break;
									case 'woocommerce_integration':
										mo_woocommerce_integration();
										break;
									case 'link_discord_account':
										mo_link_discord_account();
										break;
								}
								?>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		<input type="button" id="mymo_btn" class="mo_discord_support-help-button" data-show="false" onclick="mo_discord_support_form('')" value="NEED HELP">
	</div>
	<?php include 'view/support_form/miniorange-discord-support-form.php'; ?>
	<script>
			function mo_discord_support_form(abc) {
				var def = "It seems that you have shown interest. Please elaborate more on your requirements.";
				if (abc == '' || abc == "undefined")
					def = "Write your query here";

				jQuery("#contact_us_phone").intlTelInput();
				var modal = document.getElementById("myModal");
				modal.style.display = "block";
				var mo_btn = document.getElementById("mymo_btn");
				mo_btn.style.display = "none";
				var span = document.getElementsByClassName("mo_support_close")[0];

				document.getElementById('mo_discord_support_msg').placeholder = def;
				document.getElementById("feature_plan").value= abc;
				span.onclick = function () {
					modal.style.display = "none";
					mo_btn.style.display = "block";
				}
				window.onclick = function (event) {
					if (event.target == modal) {
						modal.style.display = "none";
						mo_btn.style.display = "block";
					}
				}
			}

		function mo_discord_valid_query(f) {
			!(/^[a-zA-Z?,.\(\)\/@ 0-9]*$/).test(f.value) ? f.value = f.value.replace(/[^a-zA-Z?,.\(\)\/@ 0-9]/, '') : null;

		}
	</script>
	<script>
		function copyToClipboard(copyButton, element, copyelement) {
			var temp = jQuery("<input>");
			jQuery("body").append(temp);
			temp.val(jQuery(element).text()).select();
			document.execCommand("copy");
			temp.remove();
			jQuery(copyelement).text("Copied");
			jQuery(copyButton).mouseout(function () {
				jQuery(copyelement).text("Copy to Clipboard");
			});
		}


	</script>
	<?php
}
