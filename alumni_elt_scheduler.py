import time
import subprocess
import logging
import schedule
import os
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='etl_scheduler.log'
)
logger = logging.getLogger('etl_scheduler')

def run_etl_script():
    """Run the ETL script as a subprocess"""
    try:
        logger.info("Starting ETL process")
        
        # Run the ETL script
        process = subprocess.run(
            ["python3", "alumni_elt.py"],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Log the output
        if process.stdout:
            logger.info(f"ETL Output: {process.stdout}")
        
        logger.info("ETL process completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"ETL process failed with return code {e.returncode}")
        if e.stdout:
            logger.error(f"Output: {e.stdout}")
        if e.stderr:
            logger.error(f"Error: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Error running ETL script: {e}")
        return False

def start_scheduler():
    """Set up and start the scheduler"""
    logger.info("Starting ETL scheduler")
    
    # Schedule the ETL job to run every 5 minutes
    schedule.every(5).minutes.do(run_etl_script)
    
    # Run immediately on startup
    run_etl_script()
    
    logger.info("ETL scheduler is running, press CTRL+C to exit")
    
    # Keep the script running
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("ETL scheduler stopped by user")
    except Exception as e:
        logger.error(f"ETL scheduler encountered an error: {e}")

if __name__ == "__main__":
    start_scheduler()
