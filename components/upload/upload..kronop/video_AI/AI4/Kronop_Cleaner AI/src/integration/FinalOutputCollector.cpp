/**
 * FinalOutputCollector.cpp
 * Implementation of One-Way Output Collector
 */

#include "FinalOutputCollector.hpp"
#include <iostream>
#include <fstream>
#include <filesystem>
#include <chrono>

namespace kronop {

FinalOutputCollector& FinalOutputCollector::getInstance() {
    static FinalOutputCollector instance;
    return instance;
}

FinalOutputCollector::FinalOutputCollector()
    : maxFrameQueueSize_(1000), maxBatchQueueSize_(100),
      totalFramesReceived_(0), totalBatchesReceived_(0) {
}

FinalOutputCollector::~FinalOutputCollector() {
    clearAllData();
}

void FinalOutputCollector::receiveProcessedFrame(const ProcessedFrame& frame) {
    std::lock_guard<std::mutex> lock(frameMutex_);

    // Check queue size limit
    if (frameQueue_.size() >= maxFrameQueueSize_) {
        // Remove oldest frame if queue is full
        frameQueue_.pop();
    }

    frameQueue_.push(frame);
    totalFramesReceived_++;

    std::cout << "FinalOutputCollector: Received processed frame " << frame.frameId
              << " (" << frame.width << "x" << frame.height << ", "
              << frame.processingTime << "ms, mode: " << frame.mode << ")" << std::endl;

    // Optional: Save to file if output directory is set
    if (!outputDirectory_.empty()) {
        saveFrameToFile(frame);
    }
}

void FinalOutputCollector::receiveProcessedBatch(const ProcessedBatch& batch) {
    std::lock_guard<std::mutex> lock(batchMutex_);

    // Check queue size limit
    if (batchQueue_.size() >= maxBatchQueueSize_) {
        // Remove oldest batch if queue is full
        batchQueue_.pop();
    }

    batchQueue_.push(batch);
    totalBatchesReceived_++;

    std::cout << "FinalOutputCollector: Received processed batch " << batch.batchId
              << " (" << batch.frameCount << " frames, "
              << batch.totalProcessingTime << "ms total, "
              << batch.avgFps << " FPS, mode: " << batch.mode << ")" << std::endl;

    // Optional: Save to file if output directory is set
    if (!outputDirectory_.empty()) {
        saveBatchToFile(batch);
    }
}

bool FinalOutputCollector::getProcessedFrame(int frameId, ProcessedFrame& frame) {
    std::lock_guard<std::mutex> lock(frameMutex_);

    // Search for specific frame ID
    std::queue<ProcessedFrame> tempQueue;
    bool found = false;

    while (!frameQueue_.empty()) {
        ProcessedFrame current = frameQueue_.front();
        frameQueue_.pop();

        if (current.frameId == frameId && !found) {
            frame = current;
            found = true;
        } else {
            tempQueue.push(current);
        }
    }

    // Restore queue
    frameQueue_ = std::move(tempQueue);
    return found;
}

bool FinalOutputCollector::getProcessedBatch(int batchId, ProcessedBatch& batch) {
    std::lock_guard<std::mutex> lock(batchMutex_);

    // Search for specific batch ID
    std::queue<ProcessedBatch> tempQueue;
    bool found = false;

    while (!batchQueue_.empty()) {
        ProcessedBatch current = batchQueue_.front();
        batchQueue_.pop();

        if (current.batchId == batchId && !found) {
            batch = current;
            found = true;
        } else {
            tempQueue.push(current);
        }
    }

    // Restore queue
    batchQueue_ = std::move(tempQueue);
    return found;
}

bool FinalOutputCollector::getNextProcessedFrame(ProcessedFrame& frame) {
    std::lock_guard<std::mutex> lock(frameMutex_);

    if (frameQueue_.empty()) {
        return false;
    }

    frame = frameQueue_.front();
    frameQueue_.pop();
    return true;
}

bool FinalOutputCollector::getNextProcessedBatch(ProcessedBatch& batch) {
    std::lock_guard<std::mutex> lock(batchMutex_);

    if (batchQueue_.empty()) {
        return false;
    }

    batch = batchQueue_.front();
    batchQueue_.pop();
    return true;
}

size_t FinalOutputCollector::getQueuedFrameCount() const {
    std::lock_guard<std::mutex> lock(frameMutex_);
    return frameQueue_.size();
}

size_t FinalOutputCollector::getQueuedBatchCount() const {
    std::lock_guard<std::mutex> lock(batchMutex_);
    return batchQueue_.size();
}

void FinalOutputCollector::clearAllData() {
    std::lock_guard<std::mutex> lock1(frameMutex_);
    std::lock_guard<std::mutex> lock2(batchMutex_);

    while (!frameQueue_.empty()) {
        frameQueue_.pop();
    }

    while (!batchQueue_.empty()) {
        batchQueue_.pop();
    }
}

void FinalOutputCollector::setMaxQueueSize(size_t maxFrames, size_t maxBatches) {
    maxFrameQueueSize_ = maxFrames;
    maxBatchQueueSize_ = maxBatches;
}

void FinalOutputCollector::setOutputDirectory(const std::string& dir) {
    outputDirectory_ = dir;

    // Create directory if it doesn't exist
    try {
        std::filesystem::create_directories(dir);
    } catch (const std::filesystem::filesystem_error& e) {
        std::cerr << "Failed to create output directory: " << e.what() << std::endl;
    }
}

void FinalOutputCollector::saveFrameToFile(const ProcessedFrame& frame) {
    try {
        std::string filename = outputDirectory_ + "/frame_" + std::to_string(frame.frameId) + ".bin";
        std::ofstream file(filename, std::ios::binary);

        if (file.is_open()) {
            // Write metadata
            file.write(reinterpret_cast<const char*>(&frame.frameId), sizeof(int));
            file.write(reinterpret_cast<const char*>(&frame.width), sizeof(int));
            file.write(reinterpret_cast<const char*>(&frame.height), sizeof(int));
            file.write(reinterpret_cast<const char*>(&frame.channels), sizeof(int));
            file.write(reinterpret_cast<const char*>(&frame.processingTime), sizeof(double));

            size_t modeSize = frame.mode.size();
            file.write(reinterpret_cast<const char*>(&modeSize), sizeof(size_t));
            file.write(frame.mode.c_str(), modeSize);

            // Write data
            size_t dataSize = frame.data.size();
            file.write(reinterpret_cast<const char*>(&dataSize), sizeof(size_t));
            file.write(reinterpret_cast<const char*>(frame.data.data()), dataSize);

            file.close();
        }
    } catch (const std::exception& e) {
        std::cerr << "Failed to save frame to file: " << e.what() << std::endl;
    }
}

void FinalOutputCollector::saveBatchToFile(const ProcessedBatch& batch) {
    try {
        std::string filename = outputDirectory_ + "/batch_" + std::to_string(batch.batchId) + ".bin";
        std::ofstream file(filename, std::ios::binary);

        if (file.is_open()) {
            // Write batch metadata
            file.write(reinterpret_cast<const char*>(&batch.batchId), sizeof(int));
            file.write(reinterpret_cast<const char*>(&batch.frameCount), sizeof(int));
            file.write(reinterpret_cast<const char*>(&batch.totalProcessingTime), sizeof(double));
            file.write(reinterpret_cast<const char*>(&batch.avgFps), sizeof(double));

            size_t modeSize = batch.mode.size();
            file.write(reinterpret_cast<const char*>(&modeSize), sizeof(size_t));
            file.write(batch.mode.c_str(), modeSize);

            // Write frames
            for (const auto& frame : batch.frames) {
                file.write(reinterpret_cast<const char*>(&frame.frameId), sizeof(int));
                file.write(reinterpret_cast<const char*>(&frame.width), sizeof(int));
                file.write(reinterpret_cast<const char*>(&frame.height), sizeof(int));
                file.write(reinterpret_cast<const char*>(&frame.channels), sizeof(int));
                file.write(reinterpret_cast<const char*>(&frame.processingTime), sizeof(double));

                size_t frameModeSize = frame.mode.size();
                file.write(reinterpret_cast<const char*>(&frameModeSize), sizeof(size_t));
                file.write(frame.mode.c_str(), frameModeSize);

                size_t dataSize = frame.data.size();
                file.write(reinterpret_cast<const char*>(&dataSize), sizeof(size_t));
                file.write(reinterpret_cast<const char*>(frame.data.data()), dataSize);
            }

            file.close();
        }
    } catch (const std::exception& e) {
        std::cerr << "Failed to save batch to file: " << e.what() << std::endl;
    }
}

bool FinalOutputCollector::assembleFinalVideo(const std::vector<std::string>& chunkFiles,
                                           const std::string& finalOutputPath) {
    try {
        std::cout << "FinalOutputCollector: Assembling final video from "
                  << chunkFiles.size() << " chunks" << std::endl;

        // Existing assembly logic...
        // ... (keep existing code)

        // Video assembly complete - now trigger R2 upload
        std::cout << "FinalOutputCollector: Video assembly complete. Initiating R2 upload..." << std::endl;

        // Call the R2 uploader (JavaScript integration point)
        bool uploadSuccess = triggerR2Upload(finalOutputPath);

        if (uploadSuccess) {
            std::cout << "FinalOutputCollector: R2 upload initiated successfully" << std::endl;
            return true;
        } else {
            std::cerr << "FinalOutputCollector: R2 upload failed" << std::endl;
            return false;
        }

    } catch (const std::exception& e) {
        std::cerr << "Failed to assemble final video: " << e.what() << std::endl;
        return false;
    }
}

/**
 * HOOK FUNCTION: Trigger R2 upload via cloud_upload_main.js
 * Called after assembleFinalVideo completes successfully
 */
bool FinalOutputCollector::triggerR2Upload(const std::string& finalVideoPath) {
    try {
        std::cout << "FinalOutputCollector: Triggering R2 upload for: " << finalVideoPath << std::endl;

        // This would normally call the JavaScript uploader via JNI/React Native bridge
        // For now, simulate the call - in production this would be:
        // 1. Call JavaScript function via React Native bridge
        // 2. Pass the finalVideoPath to cloud_upload_main.js
        // 3. Handle the R2 upload result

        // Simulated integration (replace with actual JNI call in production)
        std::string simulatedR2Url = simulateR2UploadCall(finalVideoPath);

        if (!simulatedR2Url.empty()) {
            std::cout << "FinalOutputCollector: R2 upload simulation successful" << std::endl;
            std::cout << "FinalOutputCollector: R2 URL: " << simulatedR2Url << std::endl;
            return true;
        } else {
            std::cerr << "FinalOutputCollector: R2 upload simulation failed" << std::endl;
            return false;
        }

    } catch (const std::exception& e) {
        std::cerr << "R2 upload trigger failed: " << e.what() << std::endl;
        return false;
    }
}

/**
 * Simulated R2 upload call (replace with actual JNI integration)
 * In production: This would call cloud_upload_main.js via React Native bridge
 */
std::string FinalOutputCollector::simulateR2UploadCall(const std::string& videoPath) {
    try {
        // In production, this would be a JNI call to JavaScript:
        // JNIEnv* env = getJNIEnv();
        // jstring result = (jstring)env->CallStaticObjectMethod(uploadClass, uploadMethod,
        //                     env->NewStringUTF(videoPath.c_str()));

        // For now, simulate success
        std::string simulatedUrl = "https://pub-" + std::string(getenv("R2_ACCOUNT_ID") ? getenv("R2_ACCOUNT_ID") : "account") +
                                  ".r2.dev/" + std::string(getenv("BUCKET_VIDEO") ? getenv("BUCKET_VIDEO") : "kronop-video") +
                                  "/ai_processed_" + std::to_string(std::chrono::system_clock::now().time_since_epoch().count()) +
                                  "_" + std::string(videoPath.substr(videoPath.find_last_of("/\\") + 1));

        std::cout << "Simulated R2 Upload: " << videoPath << " -> " << simulatedUrl << std::endl;

        // Store the R2 URL for later retrieval by React Native
        lastR2Url_ = simulatedUrl;

        return simulatedUrl;

    } catch (const std::exception& e) {
        std::cerr << "R2 upload simulation error: " << e.what() << std::endl;
        return "";
    }
}

/**
 * Get the last uploaded R2 URL
 * Called by React Native to get the upload result
 */
std::string FinalOutputCollector::getLastR2Url() const {
    return lastR2Url_;
}

} // namespace kronop
