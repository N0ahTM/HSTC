<?php
/**
 * Licencing plan UI.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Licencing plan UI.
 *
 * @return void
 */
function mo_discord_licensing_plans() {
	$version = get_option( 'mo_discord_integrator_version' );
	wp_enqueue_style( 'mo_discord_plugins_page_style', plugin_dir_url( dirname( dirname( __FILE__ ) ) ) . 'includes/css/mo_discord_licensing_plan.min.css', array(), $version );
	?>

	<div style="text-align: center;background: #0C1F28; padding-top: 4px; padding-bottom: 4px; border-radius: 16px;"></div>

	<input type="hidden" id="mo_license_plan_selected" value="" />
	<div class="mo-discord-tab-content">
		<div class="active">
			<br>
			<div class="mo-discord-cd-pricing-container mo-discord-cd-has-margins"><br>
				<div class="mo-discord-id-cd-pricing-switcher">
					<p id="pricing" class="mo-discord-id-fieldset" style="background-color: #e97d68; padding-left: 10px; padding-right: 10px;">
						<label for="singlesite">Plans For Everyone</label>
					</p>
				</div>

				<ul id="list-type" class="mo-discord-cd-pricing-list cd-bounce-invert" >

					<li>
						<ul class="mo-discord-cd-pricing-wrapper" id="col1">
							<li data-type="singlesite" class="mosslp is-visible">
								<header class="mo-discord-cd-pricing-header">
									<h2 style="margin-bottom: 10%;">Free</h2>
									<div class="cd-price" style="margin-top: 9%;">
										<span class="mo-discord-cd-currency">$</span>
										<span id="mo_discord_ap1" class="mo-discord-cd-value">0</span> &nbsp;&nbsp;
									</div>
								</header> <!-- .mo-discord-cd-pricing-header -->
								<footer class="mo-discord-cd-pricing-footer">
									<a href="#" class="mo-discord-cd-select" >You are on this plan.</a>
								</footer>

								<div class="mo-discord-cd-pricing-body">
									<ul class="mo-discord-cd-pricing-features ">
										<li>Discord single sign-on</li>
										<li>Customizable Icons</li>
										<li>Basic<br> Attribute Mapping</li>
										<li> Profile Picture Mapping</li>
										<li class="mo-discord-lic-bold-cl";>X</li>
										<li class="mo-discord-lic-bold-cl";>X</li>
										<li class="mo-discord-lic-bold-cl";>X</li>
										<li class="mo-discord-lic-bold-cl";>X<br>&nbsp</li>
										<li class="mo-discord-lic-bold-cl";>X</li>
										<li class="mo-discord-lic-bold-cl";>X<br><br><br><br><br><br><br><br><br><br></li>
										<li class="mo-discord-lic-bold-cl";>X</li>
										<li><a style="cursor: pointer" onclick="mo_discord_support_form('')">Click here to Contact Us</a></li>

									</ul>
								</div> <!-- .mo-discord-cd-pricing-body -->
							</li>

							<br>


						</ul> <!-- .mo-discord-cd-pricing-wrapper -->
					</li>

					<li class="mo-discord-cd-popular">
						<ul class="mo-discord-cd-pricing-wrapper" id="col3">
							<li data-type="singlesite" class="mosslp is-visible">
								<header class="mo-discord-cd-pricing-header">
									<h2 style="margin-bottom: 10%;">Standard</h2>
									<div class="cd-price" style="margin-top: 9%;">
										<span class="mo-discord-cd-currency">$</span>
										<span id="mo_discord_pre1" class="mo-discord-cd-value">349</span> &nbsp;&nbsp;
									</div>
								</header> <!-- .mo-discord-cd-pricing-header -->
								<footer class="mo-discord-cd-pricing-footer">
									<a href="#" class="mo-discord-cd-select" onclick="mo_discord_support_form('')" >Contact Us</a>
								</footer>
								<div class="mo-discord-cd-pricing-body">
									<ul class="mo-discord-cd-pricing-features">
										<li>Discord single sign-on</li>
										<li>Customizable Icons <span style="color: #E97D68">PRO</span></li>
										<li>Advanced/Custom Attribute Mapping</li>
										<li>Profile Picture Mapping</li>
										<li>User restriction</li>
										<li>Add user to discord server</li>
										<li>Custom Redirection Option</li>
										<li>Advance role mapping (Discord to WordPress)</li>
										<li class="mo-discord-lic-bold-cl";>X</li>
										<li class="mo-discord-lic-bold-cl";>X<br><br><br><br><br><br><br><br><br><br></li>
										<li class="mo-discord-lic-bold-cl";>X</li>

										<li><a style="cursor: pointer" onclick="mo_discord_support_form('')">Click here to Contact Us</a></li>
									</ul>
								</div> <!-- .mo-discord-cd-pricing-body -->
							</li>

						</ul> <!-- .mo-discord-cd-pricing-wrapper -->
					</li>

					<li >
						<ul class="mo-discord-cd-pricing-wrapper" id="col4">
							<li data-type="singlesite" class="mosslp is-visible">
								<header class="mo-discord-cd-pricing-header">
									<h2 style="margin-bottom: 10%;">Premium</h2>
									<div class="cd-price" style="margin-top: 9%;">
										<span class="mo-discord-cd-currency">$</span>
										<span id="mo_discord_ai1" class="mo-discord-cd-value">499</span> &nbsp;&nbsp;
									</div>
								</header> <!-- .mo-discord-cd-pricing-header -->
								<footer class="mo-discord-cd-pricing-footer">
									<a href="#" class="mo-discord-cd-select" onclick="mo_discord_support_form('')" >Contact Us</a>
								</footer>
								<div class="mo-discord-cd-pricing-body">
									<ul class="mo-discord-cd-pricing-features ">
										<li>Discord single sign-on</li>
										<li>Customizable Icons <span style="color: #E97D68">PRO</span></li>
										<li>Advanced/Custom Attribute Mapping</li>
										<li>Profile Picture Mapping</li>
										<li>User restriction</li>
										<li>Add user to discord server</li>
										<li>Custom Redirection Option</li>
										<li>Advance role mapping (Discord to WordPress)</li>
										<li>WordPress to Discord role mapping</li>
										<li>
											Manage user subscription on discord server.<br><u>Supported Plugins</u><br>
											<i class="fas fa-arrow-alt-circle-right">&nbsp;</i>PaidMembershipPro<br>
											<i class="fas fa-arrow-alt-circle-right">&nbsp;</i>Memberpress
											<br><strong style="font-weight: 800">X</strong><br><br><br><br><br>
										</li>
										<li class="mo-discord-lic-bold-cl">X</li>
										<li><a style="cursor: pointer" onclick="mo_discord_support_form('')">Click here to Contact Us</a></li>
									</ul>
								</div> <!-- .mo-discord-cd-pricing-body -->
							</li>



						</ul> <!-- .mo-discord-cd-pricing-wrapper -->
					</li>

				</ul> <!-- .mo-discord-cd-pricing-list -->
			</div>
		</div>

	</div>

	<div class="mo-discord-licensing-notice">
		<h2 class="mo-oauth-h2">LICENSING POLICY</h2>
		<p style="font-size: 1em;"><span style="color: red;">*</span>Cost applicable for one instance only. The plugin licenses are subscription-based, and each license includes 12 months of maintenance, which covers version updates.<br></p>

		<p style="font-size: 1em;"><span style="color: red;">*</span>We provide deep discounts on bulk license purchases and pre-production environment licenses. As the no. of licenses increases, the discount percentage also increases. Contact us at <i><a href="mailto:discordsupport@xecurify.com">discordsupport@xecurify.com</a></i> for more information.</p>
			<br>
			<strong>Note</strong> : miniOrange does not store or transfer any data which is coming from the OAuth Provider to the WordPress. All the data remains within your premises/server. We do not provide the developer license for our paid plugins and the source code is protected. It is strictly prohibited to make any changes in the code without having written permission from miniOrange.
			<br>
			<br>
			At miniOrange, we want to ensure you are 100% happy with your purchase. If the premium plugin you purchased is not working as advertised and you've attempted to resolve any issues with our support team, which couldn't get resolved. Please email us at <i><a href="mailto:info@xecurify.com" target="_blank">info@xecurify.com</a></i> for any queries regarding the return policy.</p>
	</div>


	<script>
		jQuery('#mo_discord_page_heading').text('Licensing Plans');
	</script>


	<?php
}

