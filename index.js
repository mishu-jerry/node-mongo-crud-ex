const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mongo-ex', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Create a Mongoose Schema object for course
const courseSchema = new mongoose.Schema({
    name: String,
    author: String,
    tags: [String],
    date: {
        type: Date,
        default: Date.now
    },
    isPublished: Boolean,
    price: Number
});

// Create a Mongoose Model class 
const Course = mongoose.model('Course', courseSchema);

// Create an instance of Course
const course = new Course({
    name: 'Angular Course',
    author: 'Jerry',
    tags: ['angular', 'frontend'],
    isPublished: true,
    price: 1000
});

// Function declarations //
// ===================== //

/* for simplicity, logging the results inside the functions 
instead of returning them */

async function saveCourse(course) {
    const result = await course.save();
    // returns the saved (created and pushed) Course object

    console.log(result);
}

async function getCourses() {

    // Get all courses
    // const course = await Course.find();

    /**
     * Comparison Operators
     * =====
     * 
     * $eq   : equal
     * $ne   : not equal
     * $gt   : greater than
     * $gte  : greater than or equal to
     * $lt   : less than
     * $lte  : less than or equal to
     * $in   : in an array
     * $nin  : not in an array
     * 
     * $ indicates an MongoDB Operator
     * e.g. { price: { $gte: 100 } } indicates price >= 100
     * 
     * Logical Operators
     * =====
     * and
     * or
     * 
     * Logical operators are applied by .and([Object]), .or([Object])
     * methods after the .find() method is executed (see the example below)
     */

    // Get courses applying filters and more
    const courses = await Course

        // the param (optional) of find() is filters / conditions / comparisons,
        // pass no arg to apply no filter (i.e. Course.find())
        .find({ author: 'Jerry', isPublished: true }) // author == 'Jerry' && isPublished

        /* Comparison examples */
        //.find({ price: 100 }) // price == 100
        //.find({ price: { $gte: 100 } }) // price >= 100
        //.find({ price: { $gte: 100, $lte: 1000 } }) // price >= 100 && price <= 1000
        //.find({ price: { $in: [100, 150, 200] } }) // price == 100 || price == 150 || price == 200
        //.find({ tags: { $in: ['frontend', 'backend'] } }) // tags array contains 'frontend' or 'backend'

        // this is NOT allowed (MongoError: cannot nest $ under $in)
        //.find({ price: { $in: [ { $lt: 100 }, { $gt: 1000} ] } }) // price < 100 || price > 1000

        /* Logical and, or examples */
        //.or([ { $lt: 100 }, { $gt: 1000} ]) // price < 100 || price > 1000
        //.or([ { author: 'Jerry' }, { isPublished: true} ]) // author == 'Jerry' || isPublished
        //.or([ { tags: 'frontend' }, { tags: 'backend' } ]) // tags array contains 'frontend' or 'backend'

        // price >= 100 || name contains 'by'
        // .or([ 
        //     { price: { $gte: 100 } },
        //     { name: /.*by.*/ }
        // ]);

        //.and([ { author: 'Jerry' }, { isPublished: true} ]) // author == 'Jerry' && isPublished

        /* Regex */
        // { property: /pattern/ }
        // (the patterns used are Javascript Regex)

        // starts with Jerry.
        //.find({ author: /^Jerry/ }) // ^ : starts with

        // ends with Barman (case insensitive).
        //.find({ author: /Barman$/i}) // $ : ends with, i : case insensitive

        // contains Jerry (case insensitive).
        //.find({ author: /.*Jerry.*/ }) // .* : 0 or more chars

        // TODO: Learn more about Javascript Regex

        // limit the number of results
        .limit(10)

        // sort by 'name' property
        // 1: asc, -1: desc
        .sort({ name: 1 })
        // or,
        // .sort('name') // asc
        // .sort('-name') // desc

        // projection (select or unselect properties) 
        // (SELECT columns in SQL)
        // skip this method call to get all properties
        // 1: include, 0: exclude
        // don't mix 1 and 0, use only one of them
        //.select({ name: 1, tags: 1 })
        // or,
        // .select('name tags')

        // get the number of documents returned
        // (COUNT() in SQL)
        // use either .select() or .count(), don't use both
        .count();

    console.log(courses);
}

async function getCoursesWithPagination(pageNumber, pageSize) {

    // Get the pageNumber-th page, with pageSize number of docs in each page
    const courses = await Course
        .find()
        .skip((pageNumber - 1) * pageSize) // assuming pageNumber starts from 1
        .limit(pageSize);

    console.log('Page Number: ', pageNumber);
    console.log(courses);
}

async function updateCourse(id) {

    /**
     * Aproach 1:
     * 
     * Get the document by querying
     * Modify it's properties
     * Save
     * 
     * Pros. Useful when it is necessary to validate the modifications or
     * do any other checks before updating
     * 
     * 
     * Aproach 2:
     * 
     * Get and update the document directly
     */

    // Aproach 1
    async function doAproach1() {

        // query
        const course = await Course.findById(id);
        if (!course) return; // no course found with this id

        // modify
        course.price = 1000
        course.author = 'New Author';

        // or
        // course.set({
        //     isPublished = false,
        //     author: 'New Author'
        // });

        // save
        const result = await course.save();
        console.log(result);
    }

    // Aproach 2 //
    async function doAproach2() {

        /**
         * MongoDB Update Operators
         * =====
         * 
         * $inc : Increments the value of the field by the specified amount
         * $min : Only updates the field if the specified value is less than the existing field value.
         * $max : Only updates the field if the specified value is greater than the existing field value.
         * $rename  : Renames a field (property name)
         * $set: Sets the value of a field in a document.
         * 
         * See more-
         * @url https://docs.mongodb.com/manual/reference/operator/update/
         */

        // update and get the result (summary of the operation)
        // const result = await Course.update({ _id: id }, {
        //     // use the Update Operators
        //     $set: {
        //         author: 'Jerry',
        //         isPublished: false
        //     }
        // });

        // or, find, get the original object, then update
        // const course = await Course.findByIdAndUpdate(id, {
        //     $set: {
        //         author: 'Jerry',
        //         isPublished: false
        //     }
        // });

        // or, find, update, then get the updated object
        const course = await Course.findByIdAndUpdate(id, {
            $set: {
                author: 'Jerry',
                isPublished: false
            }
        }, { new: true });

        console.log(course);
    }

    doAproach2();
}

async function removeCourse(id) {

    // find and delete (only the first object found),
    // and get the result (summary of the operation)
    // const result = await Course.deleteOne({ _id: id });

    // same but do for multiple objects
    //const result = await Course.deleteMany({ _id: id });

    // same but get the deleted object instead of result
    const course = await Course.findByIdAndRemove(id);

    console.log(course);
}

// Function calls //
// ============== //

//saveCourse(course);

//getCourses();

// (pageNumber, pageSize)
//getCoursesWithPagination(1, 1);

//updateCourse('5f8f104d4b25f43cc8641234');

removeCourse('5f8f104d4b25f43cc8641234');