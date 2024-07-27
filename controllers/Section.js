const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
const mongoose = require("mongoose")
// CREATE a new section
exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	} catch (error) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: section,
			data:course,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// // DELETE a section
// exports.deleteSection = async (req, res) => {
// 	try {
		
// 		const { sectionId, courseId }  = req.body;
// 		await Course.findByIdAndUpdate(courseId, {
// 			$pull: {
// 				courseContent: sectionId,
// 			}
// 		})
// 		console.log("I am here");
// 		const section = await Section.findById(sectionId);
		
// 		console.log(sectionId, courseId);
		
		
// 		if(!section) {
// 			return res.status(404).json({
// 				success:false,
// 				message:"Section not Found",
// 			})
// 		}

// 		//delete sub section
// 		await SubSection.deleteMany({_id: {$in: section.subSection}});
		
// 		await Section.findByIdAndDelete(sectionId);
		

// 		//find the updated course and return 
// 		const course = await Course.findById(courseId).populate({
// 			path:"courseContent",
// 			populate: {
// 				path: "subSection"
// 			}
// 		})
// 		.exec();

// 		res.status(200).json({
// 			success:true,
// 			message:"Section deleted",
// 			data:course
// 		});
// 	} catch (error) {
// 		console.error("Error deleting section:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 		});
// 	}
// };   

exports.deleteSection = async (req, res) => {
	try {
		const { sectionId, courseId } = req.body;
		console.log("I am here");
		// Validate ObjectIds
		// console.log("sectionId:", sectionId);
		// console.log("courseId:", courseId);
		if (!mongoose.Types.ObjectId.isValid(sectionId) || !mongoose.Types.ObjectId.isValid(courseId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid sectionId or courseId",
			});
		}

		// Remove section from course content
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		});
		

		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);

		if (!section) {
			return res.status(404).json({
				success: false,
				message: "Section not found",
			});
		}

		// Delete sub-sections
		await SubSection.deleteMany({ _id: { $in: section.subSection } });

		// Delete section
		await Section.findByIdAndDelete(sectionId);

		// Find and return the updated course
		const course = await Course.findById(courseId).populate({
			path: "courseContent",
			populate: {
				path: "subSection"
			}
		}).exec();

		res.status(200).json({
			success: true,
			message: "Section deleted",
			data: course,
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};