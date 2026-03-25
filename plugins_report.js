const { reject } = require('async');
const fs = require('fs');
const { resolve } = require('path');
const XMLHttpRequest = require('xhr2');
const FormData = require('form-data');
const axios = require('axios');
const mysql = require('mysql');

exports.register = function () {
	const plugin = this;
	plugin.logdebug("Initializing OLDSCHOOL delivery hook plugin.");
	plugin.check_report_directory();
};

exports.check_report_directory = function() {
	const plugin = this;
	
	var dir = "delivery";
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);

		fs.writeFile('delivery/delivery_mail.log', "", function (err) {

		});
	}
	
}


exports.hook_send_email = function (next, hmail) {
	const plugin = this;
	
	if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '0')) {
		return next();

	} else if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '1')) {
		try {
			var data = new FormData();
			
			if (hmail.todo.notes.conn_type == 'no_auth') {
				data.append("domain", hmail.todo.notes.mail_from_original.host);
			} else {
				data.append("username", hmail.todo.notes.user);
			}
			
			data.append("host", hmail.todo.notes.host);
			data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
			data.append("to",hmail.todo.rcpt_to.toString());  
			data.append("subject",hmail.todo.notes.mail_subject);
			data.append("content",hmail.todo.notes.mail_content);
			data.append("status","IN DELIVERY PROCESS");
			data.append("status_code","250");
			data.append("status_detail","Sending mail to recipient SMTP server");
			data.append("date", parseInt((new Date().getTime() / 1000).toFixed(0)));
			data.append("tags", hmail.todo.notes.mail_tags);
			data.append("id", hmail.todo.notes.mail_id);
			data.append("id", mail_id_dummy);
			data.append("message_guid",hmail.todo.notes.message_guid);
			data.append("internal-key","wkwkwkwkwkwkwk");
			data.append("x-oldschool-skip",1);
			
			axios.post(hmail.todo.notes.postdeliverycallformat, data, {
				headers: data.getHeaders()
			})
			.then(function(response) {
				plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
			})
			.catch(function(error) {
				plugin.loginfo("Delivery error on being sent : " + error);
			});
			
		} catch(err) {
			plugin.loginfo("Error in delivered mail logging (sending mail):  " + err);
		}
	
		return next();

	} else {
		try {
			var data = new FormData();

			if (hmail.todo.notes.conn_type == 'no_auth') {
				data.append("domain", hmail.todo.notes.mail_from_original.host);
			} else {
				data.append("username", hmail.todo.notes.user);
			}
			
			data.append("host", hmail.todo.notes.host);
			data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
			data.append("to",hmail.todo.rcpt_to.toString());  
			data.append("subject",hmail.todo.notes.mail_subject);
			data.append("content",hmail.todo.notes.mail_content);
			data.append("status","IN DELIVERY PROCESS");
			data.append("status_code","250");
			data.append("status_detail","Sending mail to recipient SMTP server");
			data.append("date", parseInt((new Date().getTime() / 1000).toFixed(0)));
			data.append("tags", hmail.todo.notes.mail_tags);
			data.append("id", hmail.todo.notes.mail_id);
			data.append("message_guid",hmail.todo.notes.message_guid);
			data.append("internal-key","wkwkwkwkwkwkwk");

			axios.post(hmail.todo.notes.postdeliverycallformat, data, {
				headers: data.getHeaders()
			})
			.then(function(response) {
				plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
			})
			.catch(function(error) {
				plugin.loginfo("Delivery error on being sent : " + error);
			});
			
		} catch(err) {
			plugin.loginfo("Error in delivered mail logging (sending mail):  " + err);
		}
	
		return next();
	}
}

exports.hook_delivered = function (next, hmail, params) {
	const plugin = this;
	
	if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '0')) {
		return next();

	} else if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '1')) {
		if (hmail.todo.notes.dbtype == 'mysql') {
			
			const mypool = mysql.createPool({
				connectionLimit : 100, //important
				host     : hmail.todo.notes.dbaddress,
				user     : hmail.todo.notes.dbuser,
				password : hmail.todo.notes.dbpasswd,
				database : hmail.todo.notes.dbname,
				debug    :  false
			});

			var thisDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
			
			if (hmail.todo.notes.conn_type == 'no_auth') {
				var mail_from_value = hmail.todo.notes.mail_from_original.host;
			} else {
				var mail_from_value = hmail.todo.notes.user;
			}
			
			var values = {
				date_delivery: thisDate, 
				mail_user: hmail.todo.notes.user, 
				mail_from: mail_from_value, 
				mail_to: hmail.todo.rcpt_to.toString(), 
				mail_ip_outbond: hmail.todo.notes.outbound_ip, 
				mail_helo_outbond: hmail.todo.notes.outbound_helo, 
				report_status: "DELIVERED", 
				report_code: "250"
			};
			
			var sql = "INSERT INTO haraka_delivery SET ?"; 
			
			mypool.query(sql, values, (err, results) => {
				if (err) {
					plugin.loginfo(err);
					
				}
				
				if (results) {
					plugin.loginfo("Number of records inserted: " + results.affectedRows);
				} 
			});
			
		}

		try {
			var data = new FormData();
			var allResponse = Object.values(params);
			
			if (hmail.todo.notes.conn_type == 'no_auth') {
				data.append("domain", hmail.todo.notes.mail_from_original.host);
			} else {
				data.append("username", hmail.todo.notes.user);
			}

			data.append("host", hmail.todo.notes.host);
			data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
			data.append("to",hmail.todo.rcpt_to.toString());  
			data.append("subject",hmail.todo.notes.mail_subject);
			data.append("content",hmail.todo.notes.mail_content);
			data.append("status","DELIVERED");
			data.append("status_code","250");
			data.append("status_detail",allResponse[2].split(" ")[0]);
			data.append("date", '' + parseInt((new Date().getTime() / 1000).toFixed(0)));
			data.append("tags", hmail.todo.notes.mail_tags);
			data.append("id", hmail.todo.notes.mail_id);
			data.append("message_guid",hmail.todo.notes.message_guid);
			data.append("internal-key","wkwkwkwkwkwkwk");
			data.append("x-oldschool-skip",1);

			axios.post(hmail.todo.notes.postdeliverycallformat, data, {
				headers: data.getHeaders()
			})
			.then(function(response) {
				plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
			})
			.catch(function(error) {
				plugin.loginfo("Delivery error on delivered : " + error);
			});

		} catch(err) {
			plugin.loginfo("Error in delivered mail logging (delivered mail): " + err);
		}
	
		return next();

	} else {
		if (hmail.todo.notes.dbtype == 'mysql') {
			
			const mypool = mysql.createPool({
				connectionLimit : 100, //important
				host     : hmail.todo.notes.dbaddress,
				user     : hmail.todo.notes.dbuser,
				password : hmail.todo.notes.dbpasswd,
				database : hmail.todo.notes.dbname,
				debug    :  false
			});

			var thisDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

			if (hmail.todo.notes.conn_type == 'no_auth') {
				var mail_from_value = hmail.todo.notes.mail_from_original.host;
			} else {
				var mail_from_value = hmail.todo.notes.user;
			}
		
			var values = {
				date_delivery: thisDate, 
				mail_user: hmail.todo.notes.user, 
				mail_from: mail_from_value, 
				mail_to: hmail.todo.rcpt_to.toString(), 
				mail_ip_outbond: hmail.todo.notes.outbound_ip, 
				mail_helo_outbond: hmail.todo.notes.outbound_helo, 
				report_status: "DELIVERED", 
				report_code: "250"
			};
			
			var sql = "INSERT INTO haraka_delivery SET ?"; 
			
			mypool.query(sql, values, (err, results) => {
				if (err) {
					plugin.loginfo(err);
					
				}
				
				if (results) {
					plugin.loginfo("Number of records inserted: " + results.affectedRows);
				} 
			});
			
		}

		try {
			var data = new FormData();
			var allResponse = Object.values(params);
			
			if (hmail.todo.notes.conn_type == 'no_auth') {
				data.append("domain", hmail.todo.notes.mail_from_original.host);
			} else {
				data.append("username", hmail.todo.notes.user);
			}

			data.append("host", hmail.todo.notes.host);
			data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
			data.append("to",hmail.todo.rcpt_to.toString());  
			data.append("subject",hmail.todo.notes.mail_subject);
			data.append("content",hmail.todo.notes.mail_content);
			data.append("status","DELIVERED");
			data.append("status_code","250");
			data.append("status_detail",allResponse[2].split(" ")[0]);
			data.append("date", '' + parseInt((new Date().getTime() / 1000).toFixed(0)));
			data.append("tags", hmail.todo.notes.mail_tags);
			data.append("id", hmail.todo.notes.mail_id);
			data.append("message_guid",hmail.todo.notes.message_guid);
			data.append("internal-key","wkwkwkwkwkwkwk");

			axios.post(hmail.todo.notes.postdeliverycallformat, data, {
				headers: data.getHeaders()
			})
			.then(function(response) {
				plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
			})
			.catch(function(error) {
				plugin.loginfo("Delivery error on delivered : " + error);
			});

		} catch(err) {
			plugin.loginfo("Error in delivered mail logging (delivered mail): " + err);
		}
	
		return next();
	}
};

exports.hook_deferred = function (next, hmail, deferredObject) {
	const plugin = this;
	
	if (parseInt(hmail.num_failures) < 4) {
		return next(DENYSOFT, 6*60*60);

	} else {
		
		if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '0')) {
			return next(OK);	
		
		} else if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '1')) {
			try {
				var data = new FormData();
				
				var status_detail = null;
				if (isNaN(deferredObject)) {
					status_detail = '';
				} else if (typeof deferredObject == 'object') {
					status_detail = deferredObject.err;
				} else {
					status_detail = '';
				}
				
				if (hmail.todo.notes.conn_type == 'no_auth') {
					data.append("domain", hmail.todo.notes.mail_from_original.host);
				} else {
					data.append("username", hmail.todo.notes.user);
				}

				data.append("host", hmail.todo.notes.host);
				data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
				data.append("to",hmail.todo.rcpt_to.toString());  
				data.append("subject",hmail.todo.notes.mail_subject);
				data.append("content",hmail.todo.notes.mail_content);
				data.append("status","DEFERRED");
				data.append("status_code","421");
				data.append("status_detail",deferredObject.err);
				data.append("date", parseInt((new Date().getTime() / 1000).toFixed(0)));
				data.append("tags", hmail.todo.notes.mail_tags);
				data.append("id", hmail.todo.notes.mail_id);
				data.append("message_guid",hmail.todo.notes.message_guid);
				data.append("internal-key","wkwkwkwkwkwkwk");
				data.append("x-oldschool-skip",1);

				axios.post(hmail.todo.notes.postdeliverycallformat, data, {
					headers: data.getHeaders()
				})
				.then(function(response) {
					plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
				})
				.catch(function(error) {
					plugin.loginfo("Delivery error on deferred : " + error);
				});
			
			} catch(err) {
				plugin.loginfo("Error in deferred mail logging: " + err);
			}

			return next(OK);

		} else {
			try {
				var data = new FormData();
				
				var status_detail = null;
				if (isNaN(deferredObject)) {
					status_detail = '';
				} else if (typeof deferredObject == 'object') {
					status_detail = deferredObject.err;
				} else {
					status_detail = '';
				}
				
				if (hmail.todo.notes.conn_type == 'no_auth') {
					data.append("domain", hmail.todo.notes.mail_from_original.host);
				} else {
					data.append("username", hmail.todo.notes.user);
				}

				data.append("host", hmail.todo.notes.host);
				data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
				data.append("to",hmail.todo.rcpt_to.toString());  
				data.append("subject",hmail.todo.notes.mail_subject);
				data.append("content",hmail.todo.notes.mail_content);
				data.append("status","DEFERRED");
				data.append("status_code","421");
				data.append("status_detail",deferredObject.err);
				data.append("date", parseInt((new Date().getTime() / 1000).toFixed(0)));
				data.append("tags", hmail.todo.notes.mail_tags);
				data.append("id", hmail.todo.notes.mail_id);
				data.append("message_guid",hmail.todo.notes.message_guid);
				data.append("internal-key","wkwkwkwkwkwkwk");

				axios.post(hmail.todo.notes.postdeliverycallformat, data, {
					headers: data.getHeaders()
				})
				.then(function(response) {
					plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
				})
				.catch(function(error) {
					plugin.loginfo("Delivery error on deferred : " + error);
				});
			
			} catch(err) {
				plugin.loginfo("Error in deferred mail logging: " + err);
			}

			return next(OK);
		}
		
	}
	
};


exports.hook_bounce = function (next, hmail, error) {
	const plugin = this;

	if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '0')) {
		return next(OK);

	} else if ((hmail.todo.notes.direct_mail == '1') && (hmail.todo.notes.force_logging == '1')) {
		if (hmail.todo.notes.dbtype == 'mysql') {
			
			const mypool = mysql.createPool({
				connectionLimit : 100, //important
				host     : hmail.todo.notes.dbaddress,
				user     : hmail.todo.notes.dbuser,
				password : hmail.todo.notes.dbpasswd,
				database : hmail.todo.notes.dbname,
				debug    :  false
			});

			var thisDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

			if (hmail.todo.notes.conn_type == 'no_auth') {
				var mail_from_value = hmail.todo.notes.mail_from_original.host;
			} else {
				var mail_from_value = hmail.todo.notes.user;
			}

			var values = {
				date_delivery: thisDate, 
				mail_user: hmail.todo.notes.user, 
				mail_from: mail_from_value, 
				mail_to: hmail.todo.rcpt_to.toString(), 
				mail_ip_outbond: hmail.todo.notes.outbound_ip, 
				mail_helo_outbond: hmail.todo.notes.outbound_helo, 
				report_status: "BOUNCED", 
				report_code: "550"
			};
			
			var sql = "INSERT INTO haraka_delivery SET ?"; 
			
			mypool.query(sql, values, (err, results) => {
				if (err) {
					plugin.loginfo(err);
					
				}
				
				if (results) {
					plugin.loginfo("Number of records inserted: " + results.affectedRows);
				} 
			});

		}

		try {
			var data = new FormData();
			
			if (hmail.todo.notes.conn_type == 'no_auth') {
				data.append("domain", hmail.todo.notes.mail_from_original.host);
			} else {
				data.append("username", hmail.todo.notes.user);
			}

			data.append("host", hmail.todo.notes.host);
			data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
			data.append("to",hmail.todo.rcpt_to.toString());  
			data.append("subject",hmail.todo.notes.mail_subject);
			data.append("content",hmail.todo.notes.mail_content);
			data.append("status","BOUNCED");
			data.append("status_code","550");
			data.append("status_detail",error.toString());
			data.append("date", "" + parseInt((new Date().getTime() / 1000).toFixed(0)));
			data.append("tags", hmail.todo.notes.mail_tags);
			data.append("id", hmail.todo.notes.mail_id);
			data.append("message_guid",hmail.todo.notes.message_guid);
			data.append("internal-key","wkwkwkwkwkwkwk");
			data.append("x-oldschool-skip",1);

			axios.post(hmail.todo.notes.postdeliverycallformat, data, {
				headers: data.getHeaders()
			})
			.then(function(response) {
				plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
			})
			.catch(function(error) {
				plugin.loginfo("Delivery error on bounced : " + error);
			});

		} catch(err) {
			plugin.loginfo("Error in bounce mail logging: " + err);
		}
		
		return next(OK);

	} else {
		if (hmail.todo.notes.dbtype == 'mysql') {
			
			const mypool = mysql.createPool({
				connectionLimit : 100, //important
				host     : hmail.todo.notes.dbaddress,
				user     : hmail.todo.notes.dbuser,
				password : hmail.todo.notes.dbpasswd,
				database : hmail.todo.notes.dbname,
				debug    :  false
			});

			var thisDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

			if (hmail.todo.notes.conn_type == 'no_auth') {
				var mail_from_value = hmail.todo.notes.mail_from_original.host;
			} else {
				var mail_from_value = hmail.todo.notes.user;
			}

			var values = {
				date_delivery: thisDate, 
				mail_user: hmail.todo.notes.user, 
				mail_from: mail_from_value, 
				mail_to: hmail.todo.rcpt_to.toString(), 
				mail_ip_outbond: hmail.todo.notes.outbound_ip, 
				mail_helo_outbond: hmail.todo.notes.outbound_helo, 
				report_status: "BOUNCED", 
				report_code: "550"
			};
			
			var sql = "INSERT INTO haraka_delivery SET ?"; 
			
			mypool.query(sql, values, (err, results) => {
				if (err) {
					plugin.loginfo(err);
					
				}
				
				if (results) {
					plugin.loginfo("Number of records inserted: " + results.affectedRows);
				} 
			});

		}

		try {
			var data = new FormData();
			
			if (hmail.todo.notes.conn_type == 'no_auth') {
				data.append("domain", hmail.todo.notes.mail_from_original.host);
			} else {
				data.append("username", hmail.todo.notes.user);
			}

			data.append("host", hmail.todo.notes.host);
			data.append("from",hmail.todo.notes.mail_from_original.user + "@" + hmail.todo.notes.mail_from_original.host);
			data.append("to",hmail.todo.rcpt_to.toString());  
			data.append("subject",hmail.todo.notes.mail_subject);
			data.append("content",hmail.todo.notes.mail_content);
			data.append("status","BOUNCED");
			data.append("status_code","550");
			data.append("status_detail",error.toString());
			data.append("date", "" + parseInt((new Date().getTime() / 1000).toFixed(0)));
			data.append("tags", hmail.todo.notes.mail_tags);
			data.append("id", hmail.todo.notes.mail_id);
			data.append("message_guid",hmail.todo.notes.message_guid);
			data.append("internal-key","wkwkwkwkwkwkwk");

			axios.post(hmail.todo.notes.postdeliverycallformat, data, {
				headers: data.getHeaders()
			})
			.then(function(response) {
				plugin.loginfo("Delivery response : " + JSON.stringify(response.data));
			})
			.catch(function(error) {
				plugin.loginfo("Delivery error on bounced : " + error);
			});

		} catch(err) {
			plugin.loginfo("Error in bounce mail logging: " + err);
		}
		
		return next(OK);
	}
};

exports.shutdown = function () {
	const plugin = this;
	plugin.logdebug("Shutting down OLDSCHOOL delivery hook plugin.")
};
