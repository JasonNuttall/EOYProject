var mongoose = require('mongoose').set('debug',true);
require('mongoose-moment')(mongoose);
var AppointmentSchema = mongoose.Schema({

appointment_date: {
	type: 'Moment'
},counsellor: {
	type:String
}, patient: {
	type:String
}

});
var Appointments = module.exports = mongoose.model('Appointment',AppointmentSchema);

module.exports.createAppointment = function(newAppointment,callback ) {
	newAppointment.save(callback);
};