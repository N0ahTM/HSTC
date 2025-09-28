<?php
/**
 * Display Feedback form.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Display Feedback form.
 *
 * @return void
 */
function mo_discord_display_feedback_form() {
	$version     = get_option( 'mo_discord_integrator_version' );
	$plugin_file = isset( $_SERVER['PHP_SELF'] ) ? basename( sanitize_text_field( wp_unslash( $_SERVER['PHP_SELF'] ) ) ) : '';
	if ( 'plugins.php' !== $plugin_file ) {
		return;
	}
	wp_enqueue_style( 'wp-pointer' );
	wp_enqueue_script( 'wp-pointer' );
	wp_enqueue_script( 'utils' );
	wp_enqueue_style( 'mo_discord_plugins_page_style', plugins_url( 'includes/css/mo_discord_feedback.min.css', __FILE__ ), array(), $version );

	?>
	</head>
	<body>

	<!-- The Modal -->
	<div id="mo_discord_myModal" class="mo_discord_modal1">

		<!-- Modal content -->
		<div class="mo_discord_modal1-content">
			<span class="mo_discord_close">&times;</span>
			<h3>What Happened? </h3>
			<form name="f" method="post" action="" id="mo_discord_feedback">
				<input type="hidden"  name="option" value="mo_discord_feedback"/>
				<input type="hidden" name="mo_discord_feedback_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-feedback-nonce' ) ); ?>"/>
				<div>
					<p style="margin-left:2%">

						<?php
						$deactivate_reasons = array(
							'Not Working',
							'Login Icons are not displayed on Custom Registration/Login page',
							'Confusing Interface',
							'Does not have the features I am looking for',
							'I dont want to register',
							'Installing paid version',
							'Other Reasons:',
						);
						$i                  = 1;
						$p                  = 1;
						foreach ( $deactivate_reasons as $deactivate_reasons ) {
							?>

					<div  class="radio" style="padding:1px;margin-left:2%">
						<label style="font-weight:normal;font-size:14.6px" for="<?php echo esc_attr( $deactivate_reasons ); ?>">
							<input  type="radio" name="deactivate_plugin" value="<?php echo esc_attr( $deactivate_reasons ); ?>" required >
							<?php echo esc_attr( $deactivate_reasons ); ?>
						</label>
					</div>
					<span id="link_id_
							<?php
							echo esc_attr( $p );
							$p++;
							?>
					"></span>
					<div id="text_
							<?php
							echo esc_attr( $i );
							$i++;
							?>
					"></div>
							<?php
						}
						if ( get_option( 'mo_discord_admin_email' ) ) {
							$email = get_option( 'mo_discord_admin_email' );
						} else {
							$email = get_option( 'admin_email' );
						}
						?>
					<br>
					Email: <input type="text" id="mo_feedback_email" name="mo_feedback_email" value="<?php echo esc_attr( $email ); ?>"/>
					<br><br>
					<div class="mo_discord_modal-footer" >
						<?php
						update_option( 'mo_discord_message', 'ERROR_WHILE_SUBMITTING_QUERY' );
						mo_discord_show_success_message();
						?>
						<input type="submit" name="submit" class="button button-primary button-large" value="submit" />
					</div>
					<div class="mo_discord_modal-footer" style="margin-top:2%;" >
						<?php
						update_option( 'mo_discord_message', 'ERROR_WHILE_SUBMITTING_QUERY' );
						mo_discord_show_success_message();
						?>
						<input type="submit" name="submit" class="button button-primary button-large" value="Skip and Deactivate"  onclick="mo_discord_remove_req()"/>
					</div>
				</div>
			</form>

		</div>

	</div>

	<script>
		function mo_discord_remove_req(){
			jQuery('input:radio[name="deactivate_plugin"]').removeAttr('required');
			return false;

		}
		jQuery('a[aria-label="Deactivate miniOrange Discord Integration"]').click(function(){
			var mo_discord_modal = document.getElementById('mo_discord_myModal');

			var mo_btn = document.getElementById("mymo_btn");

			var span = document.getElementsByClassName("mo_discord_close")[0];

			mo_discord_modal.style.display = "block";
			var i=0;
			var show_link='';

			jQuery('input:radio[name="deactivate_plugin"]').click(function () {
				var reason= jQuery(this).val();
				jQuery('#mo_discord_query_feedback').removeAttr('required');

				if(reason=='Facing issues During Registration'){
					jQuery('#mo_discord_query_feedback').attr("placeholder", "Can you please describe the issue in detail?");
					jQuery('#link_id').hide();
				}
				else if(reason=="Not Working"){
					add_text_box(1,"Please specify which functionality is not working.");
				}
				else if(reason=="Login Icons are not displayed on Custom Registration/Login page"){
					show_link='<p style="background-color:#feffb2;padding:5px 10px;">Please add <b>[miniorange_discord_login]</b> shortcode on custom registration/login page.</p>';
					add_text_box(2,"If you are still facing the issue please elaborate here.");
				}
				else if(reason=="Confusing Interface"){
					add_text_box(3,"Finding it confusing? Let us know so that we can improve the interface");
				}
				else if(reason=="Does not have the features I am looking for"){
					add_text_box(4,"Let us know what feature are you looking for");
				}
				else if(reason=="I dont want to register"){
					add_text_box(5,"");
				}
				else if(reason=="Installing paid version"){
					add_text_box(6,"Can you please let us know which plan you have upgraded?");
				}
				else if(reason=="Other Reasons:"){
					add_text_box(7,"Can you let us know the reason for deactivation?");
				}
				else if(reason=="Not Receiving OTP During Registration"){
					show_link='<p style="background-color:#feffb2;padding:5px 10px;">Please '+'<a href="https://www.miniorange.com/businessfreetrial" target="_blank"><b>click here</b></a>'+' to create an account.</p>';
					add_text_box(8,"Can you please describe the issue in detail?");

				}
			});

			function add_text_box(x,place_holder) {
				jQuery('#text_'+x).html('<textarea id="mo_discord_query_feedback" name="mo_discord_query_feedback"  rows="3" style="margin-left:3%" cols="50" placeholder="'+place_holder+'"></textarea>');

				for (i = 1; i <8 ; i++)
				{
					if(x==i)
					{
						if(x==0|| x==2 ||x==3||x==5) {jQuery('#link_id_' + x).html(show_link);jQuery('#link_id_' + x).show();} else{jQuery('#link_id_'+i).hide();}
					}
					else{
						jQuery('#link_id_'+i).hide();
					}
					if(i==6 && x==i){jQuery('#text_'+i).hide();jQuery('#link_id_'+i).hide();}
					if(i==x&&x!=5)
					{jQuery('#text_'+i).show();}
					else
					{jQuery('#text_'+i).hide();}
				}
			}


			span.onclick = function() {
				window.location.reload(true);
			}

			window.onclick = function(event) {
				if (event.target == mo_discord_modal) {
					mo_discord_modal.style.display = "none";
				}
			}
			return false;
		});
	</script>
	<?php

}
