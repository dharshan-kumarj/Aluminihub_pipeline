import os
import csv
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='alumni_etl.log'
)
logger = logging.getLogger('alumni_etl')

# Database connection parameters
DB_URL = "postgresql://dharshan:M1dhEFDqWRFPRo0YGddRrrl0eK8g12d1@dpg-cvso7ma4d50c73e83sf0-a.oregon-postgres.render.com/aluminidatahub"

def get_db_connection():
    try:
        conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

def fetch_recent_registrations(hours=5):
    """Fetch alumni registrations from the last specified hours"""
    conn = get_db_connection()
    if not conn:
        logger.error("Could not connect to database")
        return []
    
    try:
        cursor = conn.cursor()
        
        # First, fetch column names from the alumni table to ensure we only query existing columns
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'alumni'
        """)
        alumni_columns = [row['column_name'] for row in cursor.fetchall()]
        
        # Get user table columns
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users'
        """)
        user_columns = [row['column_name'] for row in cursor.fetchall()]
        
        logger.info(f"Alumni columns: {alumni_columns}")
        logger.info(f"User columns: {user_columns}")
        
        # Calculate timestamp for 5 hours ago
        time_threshold = datetime.now() - timedelta(hours=hours)
        
        # Build a dynamic query based on existing columns
        alumni_fields = [f"a.{col}" for col in alumni_columns if col not in ['user_id']]
        user_fields = [f"u.{col}" for col in user_columns]
        
        all_fields = alumni_fields + user_fields
        
        query = f"""
        SELECT 
            {', '.join(all_fields)}
        FROM 
            alumni a
        JOIN 
            users u ON a.user_id = u.user_id
        WHERE 
            u.created_at >= %s
            AND u.is_alumni = TRUE
        ORDER BY 
            u.created_at DESC
        """
        
        cursor.execute(query, (time_threshold,))
        registrations = cursor.fetchall()
        
        logger.info(f"Fetched {len(registrations)} alumni registrations from the last {hours} hours")
        return registrations
        
    except Exception as e:
        logger.error(f"Error fetching data: {e}")
        return []
    finally:
        conn.close()

def save_to_csv(registrations):
    """Save the registrations data to a CSV file"""
    if not registrations:
        logger.info("No registrations to save")
        return
    
    # Create output directory if it doesn't exist
    output_dir = "alumni_data"
    os.makedirs(output_dir, exist_ok=True)
    
    # Create filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/alumni_registrations_{timestamp}.csv"
    
    try:
        with open(filename, 'w', newline='') as csvfile:
            # Get field names from the first record
            fieldnames = registrations[0].keys()
            
            # Set up CSV writer
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write header and data
            writer.writeheader()
            for registration in registrations:
                writer.writerow(dict(registration))
        
        logger.info(f"Successfully saved {len(registrations)} registrations to {filename}")
        return filename
    except Exception as e:
        logger.error(f"Error saving to CSV: {e}")
        return None

def run_etl():
    """Main ETL function to fetch data and save to CSV"""
    logger.info("Starting ETL process")
    
    # Fetch registrations from the last 5 hours
    registrations = fetch_recent_registrations(hours=10)
    
    # Save to CSV
    if registrations:
        saved_file = save_to_csv(registrations)
        if saved_file:
            logger.info(f"ETL process completed successfully. Data saved to {saved_file}")
        else:
            logger.error("ETL process failed: Could not save data to CSV")
    else:
        logger.info("ETL process completed: No new registrations found")

if __name__ == "__main__":
    run_etl()