const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    date : {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date > new Date();
            },
            message: 'Show date must be in the future'
        }
    },
    time : {
        type: String,
        required: true
    },
    movie : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'movies',
        required: true
    },
    tierPrices: {
        economy: {
            type: Number,
            required: true
        },
        middle: {
            type: Number,
            required: true
        },
        premium: {
            type: Number,
            required: true
        }
    },
    totalSeats : {
        type: Number,
        required: true
    },
    bookedSeats : {
        type: Array,
        default: []
    },
    seatConfiguration: {
        economy: {
            start: Number,
            end: Number
        },
        middle: {
            start: Number,
            end: Number
        },
        premium: {
            start: Number,
            end: Number
        }
    },
    theatre : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'theatres',
        required: true
    },
} , { timestamps: true });

// Add pre-save middleware to validate show date against movie release date
showSchema.pre('save', async function(next) {
    try {
        const movie = await mongoose.model('movies').findById(this.movie);
        if (!movie) {
            throw new Error('Movie not found');
        }
        
        const showDate = new Date(this.date);
        const movieReleaseDate = new Date(movie.releaseDate);
        
        if (showDate < movieReleaseDate) {
            throw new Error('Show date cannot be before movie release date');
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

const Show = mongoose.model('shows', showSchema);

module.exports = Show;